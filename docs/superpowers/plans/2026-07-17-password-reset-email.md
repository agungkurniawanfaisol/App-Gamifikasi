# Password Reset Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add self-service password reset for active admin and student accounts that have a local password, using an email containing both a magic link and a six-digit OTP.

**Architecture:** Server actions coordinate Prisma persistence, keyed token hashing, rate limiting, and a provider-neutral email adapter. Resend is the default provider and SendGrid is selected by environment variable. Focused auth pages reuse the existing card, form, and label conventions.

**Tech Stack:** Next.js 14 App Router, React server actions, Prisma/MySQL, bcryptjs, Node crypto, Resend/SendGrid HTTP APIs, TypeScript node:test via tsx.

---

## File map

- Create `src/lib/password-reset.ts`: token/OTP generation, keyed hashing, expiry helpers.
- Create `src/lib/mail.ts`: provider-neutral Resend/SendGrid delivery and reset email template.
- Create `src/actions/password-reset.ts`: request and consume flows with validation and rate limiting.
- Create `src/components/password-reset/forgot-password-form.tsx`: request form.
- Create `src/components/password-reset/reset-password-form.tsx`: link/OTP reset form.
- Create `src/components/password-reset/auth-card-layout.tsx`: responsive auth card shell.
- Create `src/app/forgot-password/page.tsx` and `src/app/reset-password/page.tsx`: public routes.
- Modify `src/components/login-form.tsx`: add forgot-password link.
- Modify `src/lib/labels.ts`: all user-visible and email copy.
- Modify `prisma/schema.prisma`: reset-token relation and indexed model.
- Create `prisma/migrations/20260717000000_password_reset_tokens/migration.sql`.
- Modify `.env.example`: email provider configuration.
- Create `src/lib/password-reset.test.ts` and `src/lib/mail.test.ts`.
- Modify `package.json`: test script.

### Task 1: Token primitives

- [x] Write tests proving generated tokens have sufficient entropy, OTPs have six digits, keyed hashes are deterministic, and expiry is 30 minutes.
- [x] Run `npm test -- src/lib/password-reset.test.ts` and confirm failure because the module does not exist.
- [x] Implement the minimal crypto helpers in `src/lib/password-reset.ts`.
- [x] Re-run the focused test and confirm it passes.

### Task 2: Provider-neutral email delivery

- [x] Write tests against injected `fetch` proving Resend and SendGrid receive their required payloads and headers, and invalid provider/configuration fails safely.
- [x] Run `npm test -- src/lib/mail.test.ts` and confirm failure because the module does not exist.
- [x] Implement `sendMail` plus an English HTML/plain-text reset template, with `EMAIL_DEV_LOG` restricted to non-production.
- [x] Re-run the focused test and confirm it passes.

### Task 3: Prisma persistence

- [x] Add the `User.passwordResetTokens` relation and `PasswordResetToken` model with FK, unique token hash, composite OTP lookup, expiry index, and mapped MySQL names.
- [x] Add SQL migration creating the table, indexes, FK, and cascade delete.
- [x] Run `npx prisma validate` and `npx prisma generate`.

### Task 4: Server actions

- [x] Implement Zod-validated action states for requesting reset and setting a new password.
- [x] Apply per-IP and per-email/identifier limits using the existing rate-limit helper.
- [x] Keep request responses generic for missing, inactive, and Google-only accounts.
- [x] Invalidate prior records, create one record, send the email, and remove the new record if delivery fails.
- [x] Consume link or email+OTP atomically with the password update and bcrypt hash.

### Task 5: Responsive user interface

- [x] Add English labels for titles, instructions, validation, pending states, email content, and accessible navigation.
- [x] Build the shared auth card layout and both client forms using visible labels, `min-h-11` controls, pending states, and non-enumerating feedback.
- [x] Add `/forgot-password` and `/reset-password` pages.
- [x] Add the forgot-password link beside the credentials flow on login.

### Task 6: Verification

- [x] Run `npm test`.
- [x] Run `npx prisma validate`.
- [x] Run `npx tsc --noEmit`.
- [x] Run `npm run build`.
- [x] Inspect the final diff and verify no existing unrelated work was overwritten.
- [x] Check the auth layouts at 375px, 768px, and 1280px using browser tooling if available; otherwise verify responsive utility behavior from source and report the limitation.
