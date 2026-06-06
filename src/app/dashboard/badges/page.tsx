import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { getUserBadgeOverview } from "@/actions/student/badges";
import { BadgeCollection } from "@/components/student/badges/badge-collection";
import { BadgeHero } from "@/components/student/badges/badge-hero";
import { SkillPillars } from "@/components/student/badges/skill-pillar-card";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";
import { Award } from "lucide-react";

export default async function BadgesPage() {
  const session = await requireStudent();
  const userId = getUserId(session);
  const overview = await getUserBadgeOverview(userId, { sync: true });

  return (
    <div className="animate-slide-up space-y-6 sm:space-y-8">
      <PageHeader
        title={
          <span className="flex items-center gap-2.5 sm:gap-3">
            <Award className="size-6 shrink-0 text-primary sm:size-7" />
            <span className="truncate">{labels.badges.title}</span>
          </span>
        }
        description={labels.badges.subtitle}
        className="mb-4 sm:mb-6"
      />

      <BadgeHero overview={overview} />
      <SkillPillars badges={overview.badges} />
      <BadgeCollection badges={overview.badges} />
    </div>
  );
}
