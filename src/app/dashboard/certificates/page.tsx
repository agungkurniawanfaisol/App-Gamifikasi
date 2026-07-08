import Link from "next/link";
import { getCertificatesOverview } from "@/actions/student/certificates";
import { CertificateProgress } from "@/components/student/certificates/certificate-progress";
import { CertificateCard } from "@/components/student/rewards/certificate-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";
import { ScrollText } from "lucide-react";

export default async function CertificatesPage() {
  const { certificates, levelProgress, programComplete, hasGraduationCert } =
    await getCertificatesOverview();

  return (
    <div className="animate-slide-up space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <ScrollText className="size-7 text-primary" />
            {labels.certificates.pageTitle}
          </span>
        }
        description={labels.certificates.pageSubtitle}
      />

      <CertificateProgress
        levelProgress={levelProgress}
        programComplete={programComplete}
        hasGraduationCert={hasGraduationCert}
      />

      {certificates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.map((certificate) => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ScrollText}
          title={labels.certificates.emptyTitle}
          description={labels.certificates.emptyHint}
        />
      )}

      <div className="flex justify-start">
        <Link
          href="/dashboard/learn"
          className="text-sm font-medium text-primary hover:underline"
        >
          {labels.nav.learn}
        </Link>
      </div>
    </div>
  );
}
