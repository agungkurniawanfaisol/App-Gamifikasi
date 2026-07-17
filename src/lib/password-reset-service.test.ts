import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  requestPasswordReset,
  resetPassword,
  type PasswordResetServiceDependencies,
} from "./password-reset-service";

function createDependencies() {
  const calls = {
    created: [] as Array<Record<string, unknown>>,
    deleted: [] as number[],
    sent: [] as Array<Record<string, unknown>>,
    consumed: 0,
  };

  const dependencies: PasswordResetServiceDependencies = {
    now: () => new Date("2026-07-17T00:00:00.000Z"),
    secret: "test-secret",
    baseUrl: "https://example.com",
    findEligibleUser: async () => ({
      id: 7,
      name: "Admin",
      email: "admin@example.com",
    }),
    invalidateUserTokens: async () => undefined,
    createToken: async (input) => {
      calls.created.push(input);
      return 11;
    },
    deleteToken: async (id) => {
      calls.deleted.push(id);
    },
    sendResetEmail: async (input) => {
      calls.sent.push(input);
    },
    findTokenByLinkHash: async () => ({ id: 11, userId: 7 }),
    findTokenByOtpHash: async () => ({ id: 11, userId: 7 }),
    hashPassword: async (password) => `hashed:${password}`,
    consumeTokenAndSetPassword: async () => {
      calls.consumed += 1;
      return true;
    },
  };

  return { calls, dependencies };
}

describe("requestPasswordReset", () => {
  it("does nothing observable for an ineligible account", async () => {
    const { calls, dependencies } = createDependencies();
    dependencies.findEligibleUser = async () => null;

    await requestPasswordReset("missing@example.com", dependencies);

    assert.equal(calls.created.length, 0);
    assert.equal(calls.sent.length, 0);
  });

  it("stores hashed credentials and sends both raw channels", async () => {
    const { calls, dependencies } = createDependencies();

    await requestPasswordReset("ADMIN@EXAMPLE.COM", dependencies);

    assert.equal(calls.created.length, 1);
    assert.match(String(calls.created[0]?.tokenHash), /^[a-f0-9]{64}$/);
    assert.match(String(calls.created[0]?.otpHash), /^[a-f0-9]{64}$/);
    assert.equal(calls.sent[0]?.to, "admin@example.com");
    assert.match(String(calls.sent[0]?.otp), /^\d{6}$/);
    assert.match(
      String(calls.sent[0]?.resetUrl),
      /^https:\/\/example\.com\/reset-password\?token=/
    );
  });

  it("removes the unusable token when delivery fails", async () => {
    const { calls, dependencies } = createDependencies();
    dependencies.sendResetEmail = async () => {
      throw new Error("provider unavailable");
    };

    await assert.rejects(
      requestPasswordReset("admin@example.com", dependencies),
      /provider unavailable/
    );
    assert.deepEqual(calls.deleted, [11]);
  });
});

describe("resetPassword", () => {
  it("consumes a valid link token with the new password hash", async () => {
    const { calls, dependencies } = createDependencies();

    const success = await resetPassword(
      { token: "raw-token", password: "new-secret" },
      dependencies
    );

    assert.equal(success, true);
    assert.equal(calls.consumed, 1);
  });

  it("rejects when neither link token nor complete OTP credentials exist", async () => {
    const { dependencies } = createDependencies();

    const success = await resetPassword(
      { email: "admin@example.com", password: "new-secret" },
      dependencies
    );

    assert.equal(success, false);
  });
});
