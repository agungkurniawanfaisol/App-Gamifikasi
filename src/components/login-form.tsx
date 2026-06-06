"use client";

import { useFormState } from "react-dom";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { labels } from "@/lib/labels";

export function LoginForm() {
  const [error, formAction, pending] = useFormState(loginAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
      <Button type="submit" className="w-full rounded-xl" size="lg" disabled={pending}>
        {pending ? labels.auth.signingIn : labels.auth.signIn}
      </Button>
    </form>
  );
}
