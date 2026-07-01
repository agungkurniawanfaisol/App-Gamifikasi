"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { ChevronDown } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import {
  AuthFormFieldset,
  AuthSubmitButton,
} from "@/components/auth/auth-form-controls";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const [error, formAction] = useFormState(loginAction, undefined);
  const [emailFormOpen, setEmailFormOpen] = useState(false);

  useEffect(() => {
    if (error) {
      setEmailFormOpen(true);
    }
  }, [error]);

  return (
    <div className="flex flex-col gap-4">
      <GoogleSignInButton />

      <Collapsible open={emailFormOpen} onOpenChange={setEmailFormOpen}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full justify-between"
            aria-expanded={emailFormOpen}
          >
            <span>{labels.auth.signInWithEmailPassword}</span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                emailFormOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <form action={formAction} className="flex flex-col gap-4 pt-4">
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
