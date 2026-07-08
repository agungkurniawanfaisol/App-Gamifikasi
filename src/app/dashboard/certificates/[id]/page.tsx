import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { getUserCertificateById } from "@/lib/certificate-service";
import { CertificateView } from "@/components/student/rewards/certificate-view";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { labels } from "@/lib/labels";
import { ScrollText } from "lucide-react";

export default async function CertificateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireStudent();
  const userId = getUserId(session);
  const certificateId = parseInt(params.id, 10);
  if (Number.isNaN(certificateId)) notFound();

  const certificate = await getUserCertificateById(userId, certificateId);
  if (!certificate) notFound();

  const metadata = certificate.metadata as {
    userName?: string;
    levelLabel?: string;
  };
  const isGraduation = certificate.template.slug === "cert-graduation";

  return (
    <div className="animate-slide-up space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <ScrollText className="size-7 text-primary" />
            {labels.certificates.certificateDetailTitle}
          </span>
        }
      >
        <Button asChild variant="outline" size="sm" className="min-h-11">
          <Link href="/dashboard/certificates">
            {labels.certificates.backToCertificates}
          </Link>
        </Button>
      </PageHeader>

      <CertificateView
        certificateNumber={certificate.certificateNumber}
        templateTitle={certificate.template.title}
        templateSubtitle={certificate.template.subtitle}
        userName={metadata.userName ?? session.user.name ?? "Student"}
        levelLabel={metadata.levelLabel ?? certificate.template.title}
        issuedAt={certificate.issuedAt.toISOString()}
        achievementTitle={certificate.achievement?.title}
        bodyText={
          isGraduation ? labels.certificates.graduationBody : undefined
        }
      />
    </div>
  );
}
