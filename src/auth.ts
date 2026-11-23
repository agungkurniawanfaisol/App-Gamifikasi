import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";
import { headers } from "next/headers";
import { isAppUserId } from "@/lib/auth-identity";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { checkRateLimit } from "@/lib/rate-limit";

const LOGIN_RATE_LIMIT = 10;
const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000;

function getLoginClientIp(): string {
  const requestHeaders = headers();
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function provisionGoogleUser(
  email: string,
  name: string | null | undefined,
  image: string | null | undefined
) {
  const normalizedEmail = email.toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    if (!existing.isActive) {
      return null;
    }

    const updates: { profileImageUrl?: string } = {};
    if (image && !existing.profileImageUrl) {
      updates.profileImageUrl = image;
    }

    if (Object.keys(updates).length > 0) {
      return prisma.user.update({
        where: { id: existing.id },
        data: updates,
      });
    }

    return existing;
  }

  return prisma.user.create({
    data: {
      name: name?.trim() || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      role: Role.STUDENT,
      profileImageUrl: image ?? null,
      isActive: true,
    } as Parameters<typeof prisma.user.create>[0]["data"],
  });
}

async function attachDbUserToToken(
  token: {
    id?: string;
    role?: Role;
    name?: string | null;
    email?: string | null;
  },
  dbUser: { id: number; role: Role; name: string; email: string }
) {
  token.id = String(dbUser.id);
  token.role = dbUser.role;
  token.name = dbUser.name;
  token.email = dbUser.email;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase();
        const ip = getLoginClientIp();
        const ipLimit = checkRateLimit(
          `login:ip:${ip}`,
          LOGIN_RATE_LIMIT,
          LOGIN_RATE_WINDOW_MS
        );
        const emailLimit = checkRateLimit(
          `login:email:${normalizedEmail}`,
          LOGIN_RATE_LIMIT,
          LOGIN_RATE_WINDOW_MS
        );
        if (!ipLimit.allowed || !emailLimit.allowed) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (!user || !user.isActive || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      if (!user.email) {
        return false;
      }

      const dbUser = await provisionGoogleUser(
        user.email,
        user.name,
        user.image
      );
      return dbUser !== null;
    },
    async jwt({ token, user, account }) {
      // OAuth avatars bloat the JWT into chunked cookies that can corrupt after logout/re-login.
      if ("picture" in token) {
        delete (token as { picture?: unknown }).picture;
      }

      if (account?.provider === "google") {
        if (!user?.email) {
          delete token.id;
          delete (token as { role?: Role }).role;
          return token;
        }

        const dbUser = await provisionGoogleUser(
          user.email,
          user.name,
          user.image
        );
        if (!dbUser) {
          delete token.id;
          delete (token as { role?: Role }).role;
          return token;
        }

        await attachDbUserToToken(token, dbUser);
        return token;
      }

      if (user) {
        if (isAppUserId(user.id) && user.role) {
          token.id = user.id;
          token.role = user.role;
        }
      }

      // Heal corrupt sessions (e.g. Google `sub` stored as token.id from older builds).
      const needsHeal =
        typeof token.email === "string" &&
        token.email.includes("@") &&
        (!isAppUserId(token.id) ||
          (token.role !== Role.ADMIN && token.role !== Role.STUDENT));

      if (needsHeal) {
        const email = String(token.email).toLowerCase();
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            role: true,
            name: true,
            email: true,
            isActive: true,
          },
        });
        if (dbUser?.isActive) {
          await attachDbUserToToken(token, dbUser);
        } else {
          delete token.id;
          delete (token as { role?: Role }).role;
        }
      }

      return token;
    },
  },
});
