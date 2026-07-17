"use client";

import Link from "next/link";
import { useFormState } from "react-dom";

import {
  requestPasswordResetAction,
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

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState(
    requestPasswordResetAction,
    initialState
  );

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        <AuthFormFieldset className="flex flex-col gap-4">
          {state.message && (
            <Alert variant={state.status === "error" ? "destructive" : "default"}>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
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
        </AuthFormFieldset>
        <AuthSubmitButton
          idleLabel={labels.passwordReset.sendInstructions}
          pendingLabel={labels.passwordReset.sendingInstructions}
        />
      </form>

      <Button asChild variant="ghost" className="min-h-11 w-full">
        <Link href="/login">{labels.passwordReset.backToSignIn}</Link>
      </Button>
    </div>
  );
}
