import { CheckCircle2, Circle, GraduationCap } from "lucide-react";
import type { CertificateLevelProgress } from "@/actions/student/certificates";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

type CertificateProgressProps = {
  levelProgress: CertificateLevelProgress[];
  programComplete: boolean;
  hasGraduationCert: boolean;
};

export function CertificateProgress({
  levelProgress,
  programComplete,
  hasGraduationCert,
}: CertificateProgressProps) {
  const graduationStatus = hasGraduationCert
    ? "earned"
    : programComplete
      ? "ready"
      : "locked";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {labels.certificates.levelProgressTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {levelProgress.map((level) => (
            <div
              key={level.levelId}
              className="flex items-start justify-between gap-3 rounded-lg border border-border/70 p-3"
            >
              <div className="flex min-w-0 items-start gap-3">
                {level.isComplete ? (
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <p className="font-medium">{level.levelLabel}</p>
                  <p className="text-sm text-muted-foreground">
                    {level.isComplete
                      ? labels.certificates.levelComplete
                      : labels.certificates.levelInProgress(
                          level.completed,
                          level.total
                        )}
                  </p>
                </div>
              </div>
              <Badge
                variant={level.isComplete ? "default" : "outline"}
                className="shrink-0"
              >
                {level.isComplete
                  ? labels.rewards.unlocked
                  : labels.rewards.locked}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card
        className={cn(
          graduationStatus === "earned" &&
            "border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-primary/5"
        )}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="size-5 text-primary" />
            {labels.certificates.graduationTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {graduationStatus === "earned"
              ? labels.certificates.graduationEarned
              : graduationStatus === "ready"
                ? labels.certificates.graduationReady
                : labels.certificates.graduationLocked}
          </p>
          <Badge
            className="mt-4"
            variant={graduationStatus === "locked" ? "outline" : "default"}
          >
            {graduationStatus === "earned"
              ? labels.rewards.unlocked
              : graduationStatus === "ready"
                ? labels.certificates.graduationReady
                : labels.rewards.locked}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
