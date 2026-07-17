"use client";

import Link from "next/link";
import { useFormState } from "react-dom";

import {
  resetPasswordAction,
  type PasswordResetActionState,
} from "@/actions/password-reset";
import {
  AuthFormFieldset,
  AuthSubmitButton,
} from "@/components/auth/auth-form-controls";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { labels } from "@/lib/labels";

const initialState: PasswordResetActionState = { status: "idle" };

export function ResetPasswordForm({ token }: { token?: string }) {
  const [state, formAction] = useFormState(resetPasswordAction, initialState);
  const hasLinkToken = Boolean(token);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        <AuthFormFieldset className="flex flex-col gap-4">
          {state.message && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          {hasLinkToken ? (
            <input type="hidden" name="token" value={token} />
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reset-email">{labels.auth.email}</Label>
                <Input
                  id="reset-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={labels.auth.emailPlaceholder}
                  className="min-h-11"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reset-otp">{labels.passwordReset.otp}</Label>
                <Input
                  id="reset-otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder={labels.passwordReset.otpPlaceholder}
                  className="min-h-11 tracking-[0.35em]"
                  required
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="new-password">
              {labels.passwordReset.newPassword}
            </Label>
            <Input
              id="new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="min-h-11"
              minLength={6}
              maxLength={72}
              aria-describedby="new-password-hint"
              required
            />
            <p id="new-password-hint" className="text-xs text-muted-foreground">
              {labels.passwordReset.passwordHint}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-password">
              {labels.passwordReset.confirmNewPassword}
            </Label>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="min-h-11"
              minLength={6}
              maxLength={72}
              required
            />
          </div>
        </AuthFormFieldset>

        <AuthSubmitButton
          idleLabel={labels.passwordReset.resetPassword}
          pendingLabel={labels.passwordReset.resettingPassword}
        />
      </form>

      <Button asChild variant="ghost" className="min-h-11 w-full">
        <Link href="/forgot-password">
          {labels.passwordReset.requestNewLink}
        </Link>
      </Button>
    </div>
  );
}
