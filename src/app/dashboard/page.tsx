import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStudent, getUserId } from "@/lib/auth-helpers";
import { getLevelProgressSummary } from "@/lib/progression";
import { getUserRankSummary } from "@/lib/ranking-queries";
import { getProficiencySummary } from "@/lib/proficiency-queries";
import { ProficiencyCard } from "@/components/student/proficiency/proficiency-card";
import { getLearningProgressSummary } from "@/lib/skill-progress-queries";
import { LearningProgressSection } from "@/components/student/progress/learning-progress-section";
import {
  ArrowRight,
  BookOpen,
  Trophy,
  GraduationCap,
  TrendingUp,
  Sparkles,
  Medal,
  Award,
} from "lucide-react";
import { RankingPreviewCard } from "@/components/student/ranking-preview-card";
import { BadgePreviewCard } from "@/components/student/badges/badge-preview-card";
import { RewardPreviewCard } from "@/components/student/rewards/reward-preview-card";
import { ChallengePreviewCard } from "@/components/student/challenges/challenge-preview-card";
import { getNextAchievementHint } from "@/lib/achievement-engine";
import { BadgeIconRow } from "@/components/student/badge-card";
import { getEarnedBadges } from "@/actions/student/badges";
import { getLevelLabel, labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

const levelTheme: Record<
  string,
  { gradient: string; icon: typeof BookOpen; accent: string; emoji: string }
> = {
  BASIC: {
    gradient: "from-emerald-500/10 to-emerald-500/5",
    icon: BookOpen,
    accent: "text-emerald-600 dark:text-emerald-400",
    emoji: "🌱",
  },
  INTERMEDIATE: {
    gradient: "from-violet-500/10 to-violet-500/5",
    icon: GraduationCap,
    accent: "text-violet-600 dark:text-violet-400",
    emoji: "🚀",
  },
  HARD: {
    gradient: "from-amber-500/10 to-rose-500/5",
    icon: Trophy,
    accent: "text-amber-600 dark:text-amber-400",
    emoji: "🔥",
  },
};

export default async function StudentDashboardPage() {
  const session = await requireStudent();
  const userId = getUserId(session);
  const userName = session.user.name ?? "Student";

  const [levels, rankSummary, proficiencySummary, learningProgress, lastProgress, nextRewardHint] = await Promise.all([
    prisma.level.findMany({ orderBy: { order: "asc" } }),
    getUserRankSummary(userId),
    getProficiencySummary(userId),
    getLearningProgressSummary(userId),
    prisma.userProgress.findFirst({
      where: { userId, isGroupCompleted: false, lastContentItemId: { not: null } },
      orderBy: { startedAt: "desc" },
      select: {
        id: true,
        userId: true,
        groupId: true,
        isGroupCompleted: true,
        lastContentItemId: true,
        startedAt: true,
      },
    }),
    getNextAchievementHint(userId),
  ]);

  const summaries = await Promise.all(
    levels.map(async (l) => ({
      level: l,
      progress: await getLevelProgressSummary(userId, l.id),
    }))
  );

  const totalCompleted = summaries.reduce((sum, s) => sum + s.progress.completed, 0);
  const totalGroups = summaries.reduce((sum, s) => sum + s.progress.total, 0);
  const overallPercent = totalGroups > 0 ? Math.round((totalCompleted / totalGroups) * 100) : 0;

  const userTier = rankSummary?.tier ?? null;
  const userTierProgress = rankSummary?.tierProgress ?? null;

  // Fetch badges
  const earnedBadges = await getEarnedBadges();

  // Fetch group info separately for continue learning
  let lastGroupData: { id: number; title: string; levelId: number } | null = null;
  if (lastProgress) {
    lastGroupData = await prisma.learningGroup.findUnique({
      where: { id: lastProgress.groupId },
      select: { id: true, title: true, levelId: true },
    });
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* ===== WELCOME + OVERALL PROGRESS ===== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {labels.student.welcome(userName)}
          </h1>
          <p className="mt-1 text-muted-foreground">{labels.student.chooseLevel}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto">
          <RankingPreviewCard userId={userId} />
          <ChallengePreviewCard userId={userId} />
          <BadgePreviewCard userId={userId} />
          <RewardPreviewCard userId={userId} />
        </div>
      </div>

      {/* ===== HERO STATS ROW ===== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Points Card */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
          <div className="absolute -right-4 -top-4 size-16 rounded-full bg-points/5" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Points
              </p>
              <p className="mt-1 text-3xl font-bold text-points">
                {rankSummary?.points ?? 0}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-points/10">
              <Sparkles className="size-5 text-points" />
            </div>
          </div>
          {userTier && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn("font-semibold", userTier.color)}>{userTier.label}</span>
              {userTierProgress?.nextTier && (
                <>
                  <span>·</span>
                  <span>
                    {userTierProgress.nextTier.minPoints - (rankSummary?.points ?? 0)} pts to{" "}
                    {userTierProgress.nextTier.label}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Rank Card */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
          <div className="absolute -right-4 -top-4 size-16 rounded-full bg-primary/5" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rank
              </p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">
                  #{rankSummary?.rank ?? "-"}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {rankSummary?.totalParticipants ?? 0}
                </span>
              </div>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Medal className="size-5 text-primary" />
            </div>
          </div>
          <Link
            href="/dashboard/ranking"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View Leaderboard <ArrowRight className="size-3" />
          </Link>
        </div>

        {/* Progress Card */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
          <div className="absolute -right-4 -top-4 size-16 rounded-full bg-success/5" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Progress
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {overallPercent}%
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-success/10">
              <TrendingUp className="size-5 text-success" />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {totalCompleted} of {totalGroups} groups completed
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-violet-400 transition-all duration-700"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        <ProficiencyCard summary={proficiencySummary} />
      </div>

      <LearningProgressSection summary={learningProgress} />

      {nextRewardHint && (
        <p className="text-sm text-muted-foreground">
          {labels.rewards.nextRewardHint(nextRewardHint)}
        </p>
      )}

      {/* ===== CONTINUE LEARNING CARD ===== */}
      {lastGroupData && (
        <Link
          href={`/dashboard/learn/${lastGroupData.levelId}/${lastGroupData.id}`}
          className="group relative block overflow-hidden rounded-xl border border-border bg-gradient-to-r from-primary/5 via-primary/5 to-transparent p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <TrendingUp className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Continue Learning
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {lastGroupData.title}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-primary">
              Resume
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      )}

      {/* ===== EARNED BADGES ===== */}
      {earnedBadges.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              <span className="inline-flex items-center gap-2">
                <Award className="size-5 text-primary" />
                {labels.badges.earned}
              </span>
            </h2>
            <Link
              href="/dashboard/badges"
              className="text-sm font-medium text-primary hover:underline"
            >
              {labels.badges.viewAll} →
            </Link>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <BadgeIconRow badges={earnedBadges} />
          </div>
        </div>
      )}

      {/* ===== LEVEL CARDS GRID ===== */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Learning Levels</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {summaries.map(({ level, progress }, index) => {
            const percent =
              progress.total > 0
                ? Math.round((progress.completed / progress.total) * 100)
                : 0;

            const theme = levelTheme[level.name] ?? levelTheme.BASIC;
            const Icon = theme.icon;

            return (
              <Link
                key={level.id}
                href={`/dashboard/learn/${level.id}`}
                style={{ animationDelay: `${index * 100}ms` }}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md active:translate-y-0",
                  percent >= 100 ? "animate-fade-in" : "hover:-translate-y-0.5"
                )}
              >
                {/* Decorative background */}
                <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-60`} />

                {/* Large decorative emoji */}
                <span
                  className="pointer-events-none absolute -bottom-3 -right-3 select-none text-6xl opacity-[0.06] transition-opacity group-hover:opacity-[0.10]"
                  aria-hidden="true"
                >
                  {theme.emoji}
                </span>

                {/* Top accent bar */}
                <div
                  className={`relative h-1.5 w-full bg-gradient-to-r ${theme.gradient} opacity-80`}
                />

                <div className="relative flex flex-1 flex-col p-6">
                  {/* Header row */}
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${theme.gradient} ${theme.accent} shadow-sm`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold">
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          percent >= 100
                            ? "bg-success"
                            : percent > 0
                              ? "bg-primary"
                              : "bg-muted-foreground"
                        )}
                      />
                      {percent}%
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold tracking-tight">
                    {getLevelLabel(level.name)}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {labels.student.groupsCompleted(progress.completed, progress.total)}
                  </p>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Gradient progress bar */}
                  <div className="mb-4 mt-5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-violet-400 transition-all duration-700 ease-out"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* CTA Button */}
                  <div className="flex items-center gap-2 text-sm font-medium text-primary transition-all group-hover:gap-3">
                    {percent >= 100
                      ? "Review"
                      : percent > 0
                        ? labels.student.continueLearning
                        : labels.student.startLearning}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
