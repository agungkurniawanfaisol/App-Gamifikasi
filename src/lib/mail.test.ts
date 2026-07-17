import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildPasswordResetEmail, sendMail } from "./mail";

const message = {
  to: "user@example.com",
  subject: "Reset",
  html: "<p>Reset</p>",
  text: "Reset",
};

function successfulFetch(calls: Array<{ url: string; init?: RequestInit }>) {
  return async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return new Response(null, { status: 202 });
  };
}

describe("sendMail", () => {
  it("sends the Resend payload with bearer authentication", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];

    await sendMail(message, {
      env: {
        EMAIL_PROVIDER: "resend",
        EMAIL_FROM: "DeeLearn <noreply@example.com>",
        RESEND_API_KEY: "resend-key",
      },
      fetchImpl: successfulFetch(calls),
    });

    assert.equal(calls[0]?.url, "https://api.resend.com/emails");
    assert.equal(
      new Headers(calls[0]?.init?.headers).get("Authorization"),
      "Bearer resend-key"
    );
    assert.deepEqual(JSON.parse(String(calls[0]?.init?.body)), {
      from: "DeeLearn <noreply@example.com>",
      to: ["user@example.com"],
      subject: "Reset",
      html: "<p>Reset</p>",
      text: "Reset",
    });
  });

  it("sends the SendGrid payload with parsed sender details", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];

    await sendMail(message, {
      env: {
        EMAIL_PROVIDER: "sendgrid",
        EMAIL_FROM: "DeeLearn <noreply@example.com>",
        SENDGRID_API_KEY: "sendgrid-key",
      },
      fetchImpl: successfulFetch(calls),
    });

    assert.equal(calls[0]?.url, "https://api.sendgrid.com/v3/mail/send");
    assert.deepEqual(JSON.parse(String(calls[0]?.init?.body)), {
      personalizations: [{ to: [{ email: "user@example.com" }] }],
      from: { email: "noreply@example.com", name: "DeeLearn" },
      subject: "Reset",
      content: [
        { type: "text/plain", value: "Reset" },
        { type: "text/html", value: "<p>Reset</p>" },
      ],
    });
  });

  it("rejects unknown providers", async () => {
    await assert.rejects(
      sendMail(message, {
        env: {
          EMAIL_PROVIDER: "unknown",
          EMAIL_FROM: "noreply@example.com",
        },
        fetchImpl: async () => new Response(),
      }),
      /Unsupported email provider/
    );
  });

  it("sends via SMTP using the campus mail account", async () => {
    const sent: unknown[] = [];

    await sendMail(message, {
      env: {
        EMAIL_PROVIDER: "smtp",
        EMAIL_FROM: "DeeLearn <andiksusanto@universitaspgridelta.ac.id>",
        SMTP_HOST: "mail.universitaspgridelta.ac.id",
        SMTP_PORT: "587",
        SMTP_USER: "andiksusanto@universitaspgridelta.ac.id",
        SMTP_PASS: "secret",
      },
      smtpSendMail: async (mail) => {
        sent.push(mail);
      },
    });

    assert.deepEqual(sent, [
      {
        from: "DeeLearn <andiksusanto@universitaspgridelta.ac.id>",
        to: "user@example.com",
        subject: "Reset",
        text: "Reset",
        html: "<p>Reset</p>",
      },
    ]);
  });
});

describe("buildPasswordResetEmail", () => {
  it("includes both the reset link and OTP without trusting HTML input", () => {
    const email = buildPasswordResetEmail({
      name: "<Admin>",
      resetUrl: "https://example.com/reset-password?token=abc&next=<bad>",
      otp: "012345",
    });

    assert.match(email.text, /012345/);
    assert.match(email.text, /https:\/\/example.com\/reset-password/);
    assert.doesNotMatch(email.html, /<Admin>/);
    assert.match(email.html, /012345/);
  });
});
