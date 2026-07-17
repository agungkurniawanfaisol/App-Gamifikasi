import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createPasswordResetCredentials,
  hashPasswordResetValue,
  isPasswordResetExpired,
  PASSWORD_RESET_TTL_MS,
} from "./password-reset";

describe("password reset credentials", () => {
  it("creates a high-entropy URL-safe token and six-digit OTP", () => {
    const credentials = createPasswordResetCredentials();

    assert.match(credentials.token, /^[A-Za-z0-9_-]{43}$/);
    assert.match(credentials.otp, /^\d{6}$/);
  });

  it("uses a keyed deterministic hash", () => {
    const first = hashPasswordResetValue("value", "secret");
    const second = hashPasswordResetValue("value", "secret");
    const differentSecret = hashPasswordResetValue("value", "other-secret");

    assert.equal(first, second);
    assert.notEqual(first, differentSecret);
    assert.match(first, /^[a-f0-9]{64}$/);
  });

  it("expires credentials after thirty minutes", () => {
    const now = new Date("2026-07-17T00:00:00.000Z");
    const credentials = createPasswordResetCredentials(now);

    assert.equal(
      credentials.expiresAt.getTime(),
      now.getTime() + PASSWORD_RESET_TTL_MS
    );
    assert.equal(isPasswordResetExpired(credentials.expiresAt, now), false);
    assert.equal(
      isPasswordResetExpired(
        credentials.expiresAt,
        new Date(credentials.expiresAt.getTime())
      ),
      true
    );
  });
});
