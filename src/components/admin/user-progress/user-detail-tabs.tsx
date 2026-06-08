"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Role } from "@prisma/client";
import type { UserDetail } from "@/actions/admin/users";
import type { AdminUserProgressOverviewClient } from "@/lib/admin-user-progress";
import { UserForm } from "@/components/admin/user-form";
import { UserFeedbackPanel } from "@/components/admin/user-progress/user-feedback-panel";
import { UserProgressPanel } from "@/components/admin/user-progress/user-progress-panel";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ScrollableTabsList,
  Tabs,
  TabsContent,
  TabsTrigger,
} from "@/components/ui/tabs";
import { labels } from "@/lib/labels";
import { BookOpen, Sparkles } from "lucide-react";

type UserTab = "profile" | "progress" | "feedback";

function resolveTab(value: string | null): UserTab {
  if (value === "progress") return "progress";
  if (value === "feedback") return "feedback";
  return "profile";
}

function parseGroupId(value: string | null): number | null {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function UserDetailTabs({
  user,
  progressOverview,
}: {
  user: UserDetail;
  progressOverview: AdminUserProgressOverviewClient | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = resolveTab(searchParams.get("tab"));
  const feedbackId = searchParams.get("feedbackId");
  const groupId = parseGroupId(searchParams.get("groupId"));

  function onTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "profile") {
      params.delete("tab");
      params.delete("feedbackId");
      params.delete("groupId");
    } else {
      params.set("tab", value);
      if (value !== "feedback") {
        params.delete("feedbackId");
        params.delete("groupId");
      }
    }
    const qs = params.toString();
    router.replace(
      qs ? `/admin/users/${user.id}?${qs}` : `/admin/users/${user.id}`,
      { scroll: false }
    );
  }

  const studentEmpty = (
    <EmptyState
      icon={BookOpen}
      title={labels.admin.userProgress.emptyNotStudent}
    />
  );

  return (
    <Tabs value={tab} onValueChange={onTabChange}>
      <ScrollableTabsList>
        <TabsTrigger value="profile">
          {labels.admin.userProgress.tabProfile}
        </TabsTrigger>
        <TabsTrigger value="progress">
          {labels.admin.userProgress.tabProgress}
        </TabsTrigger>
        <TabsTrigger value="feedback" className="gap-1.5">
          <Sparkles className="size-3.5" />
          {labels.admin.userProgress.tabFeedback}
        </TabsTrigger>
      </ScrollableTabsList>

      <TabsContent value="profile" className="mt-6">
        <UserForm user={user} />
      </TabsContent>

      <TabsContent value="progress" className="mt-6">
        {user.role !== Role.STUDENT
          ? studentEmpty
          : progressOverview
            ? (
              <UserProgressPanel
                overview={progressOverview}
                userId={user.id}
              />
            )
            : null}
      </TabsContent>

      <TabsContent value="feedback" className="mt-6">
        {user.role !== Role.STUDENT
          ? studentEmpty
          : progressOverview
            ? (
              <UserFeedbackPanel
                overview={progressOverview}
                initialFeedbackId={feedbackId}
                initialGroupId={groupId}
              />
            )
            : null}
      </TabsContent>
    </Tabs>
  );
}
