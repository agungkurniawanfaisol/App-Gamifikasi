import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAppUserId, parseAppUserId } from "./auth-identity";

describe("isAppUserId", () => {
  it("accepts normal database ids", () => {
    assert.equal(isAppUserId("1"), true);
    assert.equal(isAppUserId("42"), true);
    assert.equal(isAppUserId("2147483647"), true);
  });

  it("rejects Google-style numeric subject ids", () => {
    assert.equal(isAppUserId("116612345678901234567"), false);
    assert.equal(isAppUserId("109876543210987654321"), false);
  });

  it("rejects non-numeric and empty values", () => {
    assert.equal(isAppUserId(""), false);
    assert.equal(isAppUserId("abc"), false);
    assert.equal(isAppUserId(undefined), false);
    assert.equal(isAppUserId(12), false);
  });
});

describe("parseAppUserId", () => {
  it("parses valid ids", () => {
    assert.equal(parseAppUserId("7"), 7);
  });

  it("returns null for Google sub sized values", () => {
    assert.equal(parseAppUserId("116612345678901234567"), null);
  });
});
