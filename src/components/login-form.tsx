"use client";

import { useFormState } from "react-dom";
import { loginAction } from "@/actions/auth";
import {
  AuthFormFieldset,
  AuthSubmitButton,
} from "@/components/auth/auth-form-controls";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { labels } from "@/lib/labels";

export function LoginForm() {
  const [error, formAction] = useFormState(loginAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <AuthFormFieldset className="flex flex-col gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{labels.auth.email}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={labels.auth.emailPlaceholder}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">{labels.auth.password}</Label>
          <Input id="password" name="password" type="password" required />
        </div>
      </AuthFormFieldset>
      <AuthSubmitButton
        idleLabel={labels.auth.signIn}
        pendingLabel={labels.auth.signingIn}
      />
    </form>
  );
}
