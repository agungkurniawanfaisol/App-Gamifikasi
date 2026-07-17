# Password Reset via Email — Design

Date: 2026-07-17
Status: Approved (pending spec review)

## Problem

The app has no "forgot password" flow. Users authenticate with email + password
(NextAuth Credentials provider) or Google OAuth. Password change is only possible
after signing in (`src/actions/profile.ts`). If a user (admin or student) forgets
their password, there is no self-service recovery path.

## Goal

Let any user who already has a password (admin + student) reset it via an email
containing **both** a magic link and a 6-digit OTP. Delivery uses an email API
(Resend by default, SendGrid selectable via env).

## Scope

In scope:
- Forgot-password request flow (enter email → receive email).
- Reset-password flow via magic link OR OTP → set new password.
- Email adapter supporting Resend (default) and SendGrid.
- New DB table for reset tokens.
- Rate limiting and anti-enumeration behavior.

Out of scope:
- Google-only users with no password (they cannot set a password through this flow).
- Passwordless / magic-link sign-in (this is password *reset*, not login).
- Migrating to a third-party auth provider.

## Users

Eligible: `isActive = true` AND `password != null`.
Google-only accounts (no password) never receive reset emails; the UI still shows
the generic confirmation to avoid account enumeration.

## Data model

New Prisma model `PasswordResetToken`:

| Field       | Type       | Notes                                              |
|-------------|------------|----------------------------------------------------|
| `id`        | Int PK     | `@id @default(autoincrement())`                    |
| `userId`    | Int FK     | → `User.id`                                        |
| `tokenHash` | String     | HMAC-SHA-256 of the magic-link token                |
| `otpHash`   | String     | HMAC-SHA-256 of the 6-digit OTP                     |
| `expiresAt` | DateTime   | 30 minutes after creation                          |
| `usedAt`    | DateTime?  | null until consumed; single-use                    |
| `createdAt` | DateTime   | `@default(now())`                                  |

Indexes (per mysql-indexing-required rule):
- `@@index([userId])` — FK + per-user invalidation
- `@@index([tokenHash])` — magic-link lookup
- `@@index([otpHash])` — OTP lookup path
- `@@index([expiresAt])` — cleanup of expired rows

Rules:
- On a new request, mark any active (unused, unexpired) tokens for that user as used/deleted.
- A valid link OR OTP consumes the same record (`usedAt` set), invalidating the other channel.

### Token generation
- Link token: 32+ random bytes (crypto), hex/base64url → URL `/reset-password?token=...`.
- OTP: cryptographically random 6 digits.
- Store only keyed HMAC-SHA-256 hashes. The key comes from
  `PASSWORD_RESET_SECRET` (falling back to `AUTH_SECRET`) so a database-only
  compromise cannot cheaply brute-force the six-digit OTP space.

## Email adapter (`src/lib/mail/`)

- `sendMail({ to, subject, html, text })` — single API.
- Driver chosen by `EMAIL_PROVIDER`:
  - `resend` (default) → Resend API, `RESEND_API_KEY`.
  - `sendgrid` → SendGrid API, `SENDGRID_API_KEY`.
- `EMAIL_FROM` required, e.g. `DeeLearn <noreply@universitaspgridelta.ac.id>`.
- Base URL for links from existing `AUTH_URL`.
- Dev without API key: when `EMAIL_DEV_LOG=true`, log the link + OTP to server logs
  instead of sending, so the flow can be tested locally.
- Send failures are logged; the user still sees the generic success message
  (no internal detail leaked).

### Email content (English, via `labels.ts`)
- Clear subject (password reset).
- User name, magic link, 6-digit OTP, 30-minute expiry.
- "Ignore this email if you did not request it."
- Plain-text fallback + simple HTML. Never include any password.

## Application flow

1. Login page (`src/app/login/page.tsx`) shows a "Forgot password?" link.
2. `/forgot-password`: user enters email.
3. App always shows a generic message: "If an account exists, reset instructions
   have been sent."
4. Email contains magic link + OTP.
5. User either:
   - clicks the magic link → `/reset-password?token=...`, or
   - opens `/reset-password` and enters email + OTP.
6. On successful new password save: token consumed, redirect to login.

## Security

- Rate limit reset requests per email/IP (e.g. 3 requests / 15 minutes).
- New password follows existing rule (min. 6 characters for now).
- Tokens/OTP expire in 30 minutes and are single-use.
- Never reveal whether an email is registered (identical response either way).
- Google-only accounts: generic response, no email sent.
- Reuse bcrypt hashing already used at login/profile update.

## Environment variables (add to `.env.example`)

```
# Email delivery for password reset
EMAIL_PROVIDER=resend        # resend | sendgrid
EMAIL_FROM=DeeLearn <noreply@universitaspgridelta.ac.id>
RESEND_API_KEY=
SENDGRID_API_KEY=
# Optional dedicated HMAC key; falls back to AUTH_SECRET
PASSWORD_RESET_SECRET=generate-another-long-random-secret
# EMAIL_DEV_LOG=true         # log link+OTP to server logs instead of sending (dev)
```

## Testing

- Unit tests: token/OTP hashing, expiry, single-use consumption.
- Action tests: request reset (eligible, ineligible, non-existent — all generic),
  reset via link, reset via OTP, expired/used token rejection.
- Manual responsive checks at 375px / 768px / 1280px for login, forgot, reset pages.

## Copy (labels.ts additions, English only)

Add an `auth`/`passwordReset` group covering: forgot title/subtitle, email label,
send button, generic confirmation, reset title, OTP label, new password label,
confirm password, success message, expired/invalid token error, rate-limited error.
