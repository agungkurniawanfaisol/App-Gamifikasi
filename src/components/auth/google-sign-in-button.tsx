"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
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
        variant="default"
        className="min-h-11 w-full"
        disabled={pending}
        onClick={handleGoogleSignIn}
      >
        {labels.auth.continueWithGoogle}
      </Button>
    </div>
  );
}
