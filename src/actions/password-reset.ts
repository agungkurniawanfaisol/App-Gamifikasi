"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { buildPasswordResetEmail, sendMail } from "@/lib/mail";
import {
  getPasswordResetSecret,
  hashPasswordResetValue,
} from "@/lib/password-reset";
import {
  requestPasswordReset,
  resetPassword,
  type PasswordResetServiceDependencies,
} from "@/lib/password-reset-service";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { labels } from "@/lib/labels";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const REQUEST_LIMIT = 3;
const RESET_LIMIT = 5;

const emailSchema = z.string().trim().email();
const passwordSchema = z.string().min(6).max(72);

export type PasswordResetActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const initialState: PasswordResetActionState = { status: "idle" };

function getClientIp(): string {
  const requestHeaders = headers();
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

function isAllowed(prefix: string, identifier: string, limit: number): boolean {
  const ipResult = checkRateLimit(
    `${prefix}:ip:${getClientIp()}`,
    limit,
    RATE_LIMIT_WINDOW_MS
  );
  const secret = getPasswordResetSecret();
  const identifierHash = hashPasswordResetValue(identifier, secret);
  const identifierResult = checkRateLimit(
    `${prefix}:identifier:${identifierHash}`,
    limit,
    RATE_LIMIT_WINDOW_MS
  );
  return ipResult.allowed && identifierResult.allowed;
}

function getBaseUrl(): string {
  const value = process.env.AUTH_URL?.trim();
  if (!value) {
    throw new Error("AUTH_URL must be configured for password reset");
  }
  return new URL(value).origin;
}

function createServiceDependencies(): PasswordResetServiceDependencies {
  const tokenClient = prisma.passwordResetToken;

  return {
    now: () => new Date(),
    secret: getPasswordResetSecret(),
    baseUrl: getBaseUrl(),
    findEligibleUser: async (email) => {
      const user = await prisma.user.findFirst({
        where: { email, isActive: true },
        select: { id: true, name: true, email: true, password: true },
      });
      if (!user?.password) {
        return null;
      }

      return { id: user.id, name: user.name, email: user.email };
    },
    invalidateUserTokens: async (userId, usedAt) => {
      await tokenClient.updateMany({
        where: { userId, usedAt: null },
        data: { usedAt },
      });
    },
    createToken: async (input) => {
      const record = await tokenClient.create({ data: input });
      return record.id;
    },
    deleteToken: async (id) => {
      await tokenClient.deleteMany({ where: { id } });
    },
    sendResetEmail: async ({ to, name, resetUrl, otp }) => {
      const email = buildPasswordResetEmail({ name, resetUrl, otp });
      await sendMail({ to, ...email });
    },
    findTokenByLinkHash: async (tokenHash, now) =>
      tokenClient.findFirst({
        where: { tokenHash, usedAt: null, expiresAt: { gt: now } },
        select: { id: true, userId: true },
      }),
    findTokenByOtpHash: async (email, otpHash, now) => {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (!user) {
        return null;
      }

      return tokenClient.findFirst({
        where: {
          userId: user.id,
          otpHash,
          usedAt: null,
          expiresAt: { gt: now },
        },
        select: { id: true, userId: true },
        orderBy: { createdAt: "desc" },
      });
    },
    hashPassword: (password) => bcrypt.hash(password, 10),
    consumeTokenAndSetPassword: async (token, passwordHash, usedAt) =>
      prisma.$transaction(async (transaction) => {
        const result = await transaction.passwordResetToken.updateMany({
          where: {
            id: token.id,
            userId: token.userId,
            usedAt: null,
            expiresAt: { gt: usedAt },
          },
          data: { usedAt },
        });
        if (result.count !== 1) {
          return false;
        }

        await transaction.user.update({
          where: { id: token.userId },
          data: { password: passwordHash },
          select: { id: true },
        });
        return true;
      }),
  };
}

export async function requestPasswordResetAction(
  _previousState: PasswordResetActionState = initialState,
  formData: FormData
): Promise<PasswordResetActionState> {
  const parsedEmail = emailSchema.safeParse(formData.get("email"));
  if (!parsedEmail.success) {
    return { status: "error", message: labels.passwordReset.invalidEmail };
  }

  if (!isAllowed("password-reset-request", parsedEmail.data, REQUEST_LIMIT)) {
    return { status: "error", message: labels.passwordReset.rateLimited };
  }

  try {
    await requestPasswordReset(
      parsedEmail.data,
      createServiceDependencies()
    );
  } catch (error) {
    console.error("Password reset email could not be sent", error);
  }

  return {
    status: "success",
    message: labels.passwordReset.genericConfirmation,
  };
}

export async function resetPasswordAction(
  _previousState: PasswordResetActionState = initialState,
  formData: FormData
): Promise<PasswordResetActionState> {
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const token = String(formData.get("token") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const otp = String(formData.get("otp") ?? "").trim();

  const parsedPassword = passwordSchema.safeParse(password);
  if (!parsedPassword.success) {
    return { status: "error", message: labels.passwordReset.invalidPassword };
  }
  if (parsedPassword.data !== confirmPassword) {
    return {
      status: "error",
      message: labels.passwordReset.passwordsDoNotMatch,
    };
  }

  const hasLinkToken = token.length > 0;
  const hasValidOtpInput =
    emailSchema.safeParse(email).success && /^\d{6}$/.test(otp);
  if (!hasLinkToken && !hasValidOtpInput) {
    return { status: "error", message: labels.passwordReset.invalidRequest };
  }

  const identifier = hasLinkToken ? token : `${email}:${otp}`;
  if (!isAllowed("password-reset-submit", identifier, RESET_LIMIT)) {
    return { status: "error", message: labels.passwordReset.rateLimited };
  }

  let success = false;
  try {
    success = await resetPassword(
      {
        password: parsedPassword.data,
        ...(hasLinkToken ? { token } : { email, otp }),
      },
      createServiceDependencies()
    );
  } catch (error) {
    console.error("Password reset failed", error);
  }

  if (!success) {
    return { status: "error", message: labels.passwordReset.invalidRequest };
  }

  redirect("/login?passwordReset=success");
}
