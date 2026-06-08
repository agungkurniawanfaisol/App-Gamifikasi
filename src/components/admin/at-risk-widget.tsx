import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { AtRiskReason, AtRiskStudent } from "@/lib/admin-at-risk";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { labels } from "@/lib/labels";

const reasonLabels: Record<AtRiskReason, string> = {
  stuck: labels.admin.atRiskReasonStuck,
  inactive: labels.admin.atRiskReasonInactive,
  overdue: labels.admin.atRiskReasonOverdue,
  low_accuracy: labels.admin.atRiskReasonLowAccuracy,
};

const reasonVariants: Record<
  AtRiskReason,
  "default" | "secondary" | "destructive" | "outline"
> = {
  stuck: "secondary",
  inactive: "outline",
  overdue: "destructive",
  low_accuracy: "default",
};

export function AtRiskWidget({ students }: { students: AtRiskStudent[] }) {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="size-5 text-amber-500" />
          {labels.admin.atRiskTitle}
        </CardTitle>
        <CardDescription>{labels.admin.atRiskDescription}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        {students.length === 0 ? (
          <EmptyState icon={AlertTriangle} title={labels.admin.atRiskEmpty} />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {students.map((student) => (
              <li key={student.userId}>
                <Link
                  href={`/admin/users/${student.userId}`}
                  className="flex flex-col gap-2 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{student.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {student.detail}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {student.reasons.map((reason) => (
                      <Badge
                        key={reason}
                        variant={reasonVariants[reason]}
                        className="shrink-0"
                      >
                        {reasonLabels[reason]}
                      </Badge>
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
