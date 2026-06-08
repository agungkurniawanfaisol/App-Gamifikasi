import type { LearningProgressSummaryClient } from "@/lib/admin-user-progress";
import { SkillProgressRow } from "@/components/student/progress/skill-progress-row";
import { labels } from "@/lib/labels";

export function UserProgressSkills({
  summary,
}: {
  summary: LearningProgressSummaryClient;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {labels.admin.userProgress.skillsTitle}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {summary.skills.map((stat) => (
          <SkillProgressRow key={stat.skill} stat={stat} compact />
        ))}
      </div>
    </section>
  );
}
