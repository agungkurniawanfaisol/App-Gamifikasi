import type { Metadata } from "next";

import { AuthCardLayout } from "@/components/password-reset/auth-card-layout";
import { ResetPasswordForm } from "@/components/password-reset/reset-password-form";
import { labels } from "@/lib/labels";

export const metadata: Metadata = {
  title: labels.passwordReset.resetTitle,
};

type ResetPasswordPageProps = {
  searchParams: { token?: string | string[] };
};

export default function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const token =
    typeof searchParams.token === "string" ? searchParams.token : undefined;

  return (
    <AuthCardLayout
      title={labels.passwordReset.resetTitle}
      subtitle={labels.passwordReset.resetSubtitle}
    >
      <ResetPasswordForm token={token} />
    </AuthCardLayout>
  );
}
