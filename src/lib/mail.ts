import { labels } from "@/lib/labels";

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type MailOptions = {
  env?: Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
  logger?: Pick<Console, "info">;
};

type PasswordResetEmailInput = {
  name: string;
  resetUrl: string;
  otp: string;
};

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character
  );
}

function requireConfig(
  env: Record<string, string | undefined>,
  key: string
): string {
  const value = env[key]?.trim();
  if (!value) {
    throw new Error(`${key} must be configured`);
  }
  return value;
}

function parseSender(from: string): { email: string; name?: string } {
  const match = from.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);
  if (!match) {
    return { email: from };
  }

  return {
    email: match[2].trim(),
    ...(match[1].trim() ? { name: match[1].trim() } : {}),
  };
}

async function postEmail(
  url: string,
  apiKey: string,
  body: unknown,
  fetchImpl: typeof fetch
): Promise<void> {
  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Email provider request failed with status ${response.status}`);
  }
}

export async function sendMail(
  message: MailMessage,
  options: MailOptions = {}
): Promise<void> {
  const env = options.env ?? process.env;
  const logger = options.logger ?? console;

  if (env.EMAIL_DEV_LOG === "true" && env.NODE_ENV !== "production") {
    logger.info("[email-dev]", message);
    return;
  }

  const provider = env.EMAIL_PROVIDER?.trim().toLowerCase() || "resend";
  const from = requireConfig(env, "EMAIL_FROM");
  const fetchImpl = options.fetchImpl ?? fetch;

  if (provider === "resend") {
    await postEmail(
      "https://api.resend.com/emails",
      requireConfig(env, "RESEND_API_KEY"),
      {
        from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      },
      fetchImpl
    );
    return;
  }

  if (provider === "sendgrid") {
    await postEmail(
      "https://api.sendgrid.com/v3/mail/send",
      requireConfig(env, "SENDGRID_API_KEY"),
      {
        personalizations: [{ to: [{ email: message.to }] }],
        from: parseSender(from),
        subject: message.subject,
        content: [
          { type: "text/plain", value: message.text },
          { type: "text/html", value: message.html },
        ],
      },
      fetchImpl
    );
    return;
  }

  throw new Error(`Unsupported email provider: ${provider}`);
}

export function buildPasswordResetEmail({
  name,
  resetUrl,
  otp,
}: PasswordResetEmailInput): Omit<MailMessage, "to"> {
  const safeUrl = escapeHtml(resetUrl);
  const safeOtp = escapeHtml(otp);
  const greeting = labels.passwordReset.emailGreeting(name);

  return {
    subject: labels.passwordReset.emailSubject,
    text: [
      greeting,
      "",
      labels.passwordReset.emailIntro,
      "",
      labels.passwordReset.emailLinkInstruction,
      resetUrl,
      "",
      labels.passwordReset.emailOtpInstruction,
      otp,
      "",
      labels.passwordReset.emailExpiry,
      labels.passwordReset.emailIgnore,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:600px;margin:0 auto">
        <p>${escapeHtml(greeting)}</p>
        <p>${escapeHtml(labels.passwordReset.emailIntro)}</p>
        <p>${escapeHtml(labels.passwordReset.emailLinkInstruction)}</p>
        <p><a href="${safeUrl}" style="display:inline-block;padding:12px 18px;background:#6d28d9;color:#fff;text-decoration:none;border-radius:8px">${escapeHtml(labels.passwordReset.resetPassword)}</a></p>
        <p>${escapeHtml(labels.passwordReset.emailOtpInstruction)}</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px">${safeOtp}</p>
        <p>${escapeHtml(labels.passwordReset.emailExpiry)}</p>
        <p>${escapeHtml(labels.passwordReset.emailIgnore)}</p>
      </div>
    `.trim(),
  };
}
