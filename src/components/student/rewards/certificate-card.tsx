import Link from "next/link";
import { Award } from "lucide-react";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

type CertificateRow = {
  id: number;
  certificateNumber: string;
  issuedAt: Date;
  template: { title: string; subtitle: string };
  metadata: unknown;
};

export function CertificateCard({
  certificate,
  className,
}: {
  certificate: CertificateRow;
  className?: string;
}) {
  const metadata = certificate.metadata as { userName?: string; levelLabel?: string };

  return (
    <Link
      href={`/dashboard/certificates/${certificate.id}`}
      className={cn(
        "group block overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-card to-primary/5 p-5 shadow-sm transition-all hover:border-amber-500/40 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
          <Award className="size-6" />
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {new Date(certificate.issuedAt).toLocaleDateString()}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-bold tracking-tight group-hover:text-primary">
        {certificate.template.title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {metadata.levelLabel ?? certificate.template.subtitle}
      </p>
      <p className="mt-3 font-mono text-xs text-muted-foreground">
        {certificate.certificateNumber}
      </p>
      <p className="mt-3 text-xs font-medium text-primary">
        {labels.rewards.viewCertificate}
      </p>
    </Link>
  );
}
