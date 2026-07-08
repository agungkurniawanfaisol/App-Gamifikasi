"use client";

import { Award } from "lucide-react";
import { labels } from "@/lib/labels";
import { Button } from "@/components/ui/button";

type CertificateViewProps = {
  certificateNumber: string;
  templateTitle: string;
  templateSubtitle: string;
  userName: string;
  levelLabel: string;
  issuedAt: string;
  achievementTitle?: string | null;
  bodyText?: string;
};

export function CertificateView({
  certificateNumber,
  templateTitle,
  templateSubtitle,
  userName,
  levelLabel,
  issuedAt,
  achievementTitle,
  bodyText,
}: CertificateViewProps) {
  return (
    <div className="space-y-6">
      <div
        id="certificate-print"
        className="mx-auto max-w-3xl rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-5 text-center shadow-lg sm:p-10 dark:from-amber-950/20 dark:via-card dark:to-sky-950/20 print:border-amber-700 print:shadow-none"
      >
        <Award className="mx-auto size-12 text-amber-600 dark:text-amber-400 sm:size-14" />
        <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:mt-6 sm:text-xs sm:tracking-[0.3em]">
          {templateSubtitle}
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:mt-4 sm:text-4xl">
          {templateTitle}
        </h1>
        <p className="mt-6 text-sm text-muted-foreground sm:mt-8">
          {labels.rewards.certificatePresentedTo}
        </p>
        <p className="mt-2 break-words text-2xl font-serif font-bold text-foreground sm:text-4xl">
          {userName}
        </p>
        <p className="mx-auto mt-8 max-w-lg text-sm leading-relaxed text-muted-foreground">
          {bodyText ?? labels.rewards.certificateBody(levelLabel)}
        </p>
        {achievementTitle && (
          <p className="mt-4 text-sm font-semibold text-primary">
            {achievementTitle}
          </p>
        )}
        <div className="mt-10 flex flex-col items-center gap-1 border-t border-border/60 pt-8">
          <p className="font-mono text-xs text-muted-foreground">
            {certificateNumber}
          </p>
          <p className="text-xs text-muted-foreground">
            {labels.rewards.issuedOn(new Date(issuedAt).toLocaleDateString())}
          </p>
        </div>
      </div>

      <div className="flex justify-center print:hidden">
        <Button type="button" variant="outline" onClick={() => window.print()}>
          {labels.rewards.downloadCertificate}
        </Button>
      </div>
    </div>
  );
}
