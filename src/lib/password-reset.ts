import { createHmac, randomBytes, randomInt } from "node:crypto";

export const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;

export type PasswordResetCredentials = {
  token: string;
  otp: string;
  expiresAt: Date;
};

export function createPasswordResetCredentials(
  now: Date = new Date()
): PasswordResetCredentials {
  return {
    token: randomBytes(32).toString("base64url"),
    otp: randomInt(0, 1_000_000).toString().padStart(6, "0"),
    expiresAt: new Date(now.getTime() + PASSWORD_RESET_TTL_MS),
  };
}

export function hashPasswordResetValue(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function isPasswordResetExpired(
  expiresAt: Date,
  now: Date = new Date()
): boolean {
  return expiresAt.getTime() <= now.getTime();
}

export function getPasswordResetSecret(): string {
  const secret = process.env.PASSWORD_RESET_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("PASSWORD_RESET_SECRET or AUTH_SECRET must be configured");
  }
  return secret;
}
