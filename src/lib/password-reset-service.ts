import {
  createPasswordResetCredentials,
  hashPasswordResetValue,
} from "@/lib/password-reset";

type EligibleUser = {
  id: number;
  name: string;
  email: string;
};

type StoredResetToken = {
  id: number;
  userId: number;
};

type CreateTokenInput = StoredResetToken & {
  tokenHash: string;
  otpHash: string;
  expiresAt: Date;
  createdAt: Date;
};

type ResetEmailInput = {
  to: string;
  name: string;
  resetUrl: string;
  otp: string;
};

export type ResetPasswordInput = {
  password: string;
  token?: string;
  email?: string;
  otp?: string;
};

export type PasswordResetServiceDependencies = {
  now: () => Date;
  secret: string;
  baseUrl: string;
  findEligibleUser: (email: string) => Promise<EligibleUser | null>;
  invalidateUserTokens: (userId: number, usedAt: Date) => Promise<void>;
  createToken: (
    input: Omit<CreateTokenInput, "id"> & { userId: number }
  ) => Promise<number>;
  deleteToken: (id: number) => Promise<void>;
  sendResetEmail: (input: ResetEmailInput) => Promise<void>;
  findTokenByLinkHash: (
    tokenHash: string,
    now: Date
  ) => Promise<StoredResetToken | null>;
  findTokenByOtpHash: (
    email: string,
    otpHash: string,
    now: Date
  ) => Promise<StoredResetToken | null>;
  hashPassword: (password: string) => Promise<string>;
  consumeTokenAndSetPassword: (
    token: StoredResetToken,
    passwordHash: string,
    usedAt: Date
  ) => Promise<boolean>;
};

export async function requestPasswordReset(
  email: string,
  dependencies: PasswordResetServiceDependencies
): Promise<void> {
  const user = await dependencies.findEligibleUser(email.trim().toLowerCase());
  if (!user) {
    return;
  }

  const now = dependencies.now();
  const credentials = createPasswordResetCredentials(now);
  await dependencies.invalidateUserTokens(user.id, now);

  const tokenId = await dependencies.createToken({
    userId: user.id,
    tokenHash: hashPasswordResetValue(
      credentials.token,
      dependencies.secret
    ),
    otpHash: hashPasswordResetValue(credentials.otp, dependencies.secret),
    expiresAt: credentials.expiresAt,
    createdAt: now,
  });

  const baseUrl = dependencies.baseUrl.replace(/\/+$/, "");
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(
    credentials.token
  )}`;

  try {
    await dependencies.sendResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
      otp: credentials.otp,
    });
  } catch (error) {
    await dependencies.deleteToken(tokenId);
    throw error;
  }
}

export async function resetPassword(
  input: ResetPasswordInput,
  dependencies: PasswordResetServiceDependencies
): Promise<boolean> {
  const now = dependencies.now();
  const token = await findResetToken(input, dependencies, now);
  if (!token) {
    return false;
  }

  const passwordHash = await dependencies.hashPassword(input.password);
  return dependencies.consumeTokenAndSetPassword(token, passwordHash, now);
}

async function findResetToken(
  input: ResetPasswordInput,
  dependencies: PasswordResetServiceDependencies,
  now: Date
): Promise<StoredResetToken | null> {
  if (input.token) {
    const tokenHash = hashPasswordResetValue(input.token, dependencies.secret);
    return dependencies.findTokenByLinkHash(tokenHash, now);
  }

  if (!input.email || !input.otp) {
    return null;
  }

  const otpHash = hashPasswordResetValue(input.otp, dependencies.secret);
  return dependencies.findTokenByOtpHash(
    input.email.trim().toLowerCase(),
    otpHash,
    now
  );
}
