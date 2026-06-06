import type { SkillProgressStat } from "@/lib/skill-progress";
import { SkillProgressRow } from "@/components/student/progress/skill-progress-row";
import { labels } from "@/lib/labels";

export function LearningProgressSkillsCompact({
  skills,
}: {
  skills: SkillProgressStat[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {labels.progress.skillsTitle}
      </p>
      <div className="flex flex-col gap-2">
        {skills.map((stat) => (
          <SkillProgressRow key={stat.skill} stat={stat} compact />
        ))}
      </div>
    </div>
  );
}
