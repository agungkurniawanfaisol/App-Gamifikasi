import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

function getEncryptionKey(): Buffer {
  const secret =
    process.env.API_TOKEN_ENCRYPTION_KEY ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      "Set API_TOKEN_ENCRYPTION_KEY (or AUTH_SECRET) to store recoverable API tokens."
    );
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptApiTokenSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decryptApiTokenSecret(payload: string): string {
  const key = getEncryptionKey();
  const buf = Buffer.from(payload, "base64url");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export function canEncryptApiTokenSecrets(): boolean {
  return Boolean(
    process.env.API_TOKEN_ENCRYPTION_KEY ??
      process.env.AUTH_SECRET ??
      process.env.NEXTAUTH_SECRET
  );
}
