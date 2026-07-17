import type { Metadata } from "next";

import { AuthCardLayout } from "@/components/password-reset/auth-card-layout";
import { ForgotPasswordForm } from "@/components/password-reset/forgot-password-form";
import { labels } from "@/lib/labels";

export const metadata: Metadata = {
  title: labels.passwordReset.forgotTitle,
};

export default function ForgotPasswordPage() {
  return (
    <AuthCardLayout
      title={labels.passwordReset.forgotTitle}
      subtitle={labels.passwordReset.forgotSubtitle}
    >
      <ForgotPasswordForm />
    </AuthCardLayout>
  );
}
