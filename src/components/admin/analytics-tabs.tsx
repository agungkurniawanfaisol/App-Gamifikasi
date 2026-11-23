"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { AdminAnalyticsSnapshot } from "@/lib/admin-analytics";
import type { StudentAnswerReviewRoster } from "@/lib/admin-student-answer-review";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { PrintReportToolbar } from "@/components/admin/print-report-toolbar";
import { StudentAnswerRoster } from "@/components/admin/student-answer-roster";
import {
  ScrollableTabsList,
  Tabs,
  TabsContent,
  TabsTrigger,
} from "@/components/ui/tabs";
import { labels } from "@/lib/labels";

type AnalyticsTab = "overview" | "review";

function resolveTab(value: string | null): AnalyticsTab {
  return value === "review" ? "review" : "overview";
}

export function AnalyticsTabs({
  analytics,
  roster,
}: {
  analytics: AdminAnalyticsSnapshot;
  roster: StudentAnswerReviewRoster;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = resolveTab(searchParams.get("tab"));

  function onTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "overview") {
      params.delete("tab");
      params.delete("page");
    } else {
      params.set("tab", "review");
    }
    const qs = params.toString();
    router.replace(qs ? `/admin/analytics?${qs}` : "/admin/analytics", {
      scroll: false,
    });
  }

  return (
    <Tabs value={tab} onValueChange={onTabChange} className="space-y-4">
      <div className="print:hidden">
        <ScrollableTabsList>
          <TabsTrigger value="overview" className="min-h-11">
            {labels.admin.analyticsTabOverview}
          </TabsTrigger>
          <TabsTrigger value="review" className="min-h-11">
            {labels.admin.analyticsTabStudentReview}
          </TabsTrigger>
        </ScrollableTabsList>
      </div>

      <TabsContent value="overview" className="mt-4 space-y-4">
        <PrintReportToolbar />
        <div id="analytics-print-root">
          <AnalyticsDashboard data={analytics} />
        </div>
      </TabsContent>

      <TabsContent value="review" className="mt-4">
        <StudentAnswerRoster roster={roster} />
      </TabsContent>
    </Tabs>
  );
}
