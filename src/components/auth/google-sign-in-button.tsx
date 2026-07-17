"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { labels } from "@/lib/labels";

export function GoogleSignInButton() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleGoogleSignIn() {
    setError(null);
    setPending(true);
    try {
      await signIn("google", { callbackUrl: "/login" });
    } catch {
      setError(labels.auth.googleSignInFailed);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full gap-2.5 border-border bg-background font-medium shadow-sm hover:bg-muted/60"
        disabled={pending}
        onClick={handleGoogleSignIn}
        aria-label={labels.auth.continueWithGoogle}
      >
        {pending ? (
          <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" aria-hidden />
        ) : (
          <GoogleIcon title={labels.auth.googleBrand} />
        )}
        <span>
          {pending ? labels.auth.signingInWithGoogle : labels.auth.continueWithGoogle}
        </span>
      </Button>
    </div>
  );
}
