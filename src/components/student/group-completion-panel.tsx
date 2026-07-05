"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  prepareGroupCompletion,
  submitGroupTestimonial,
} from "@/actions/student/group-completion";
import { markBadgesNotified, type BadgeWithMeta } from "@/actions/student/badges";
import { BadgeCelebrationModal } from "@/components/student/badge-celebration";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { labels } from "@/lib/labels";
import { notifyProgressRewards } from "@/lib/proficiency-toast";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

type GroupCompletionPanelProps = {
  levelId: number;
  groupId: number;
  groupTitle: string;
  initialScore?: number | null;
  initialAiFeedback?: string | null;
  testimonialSubmitted: boolean;
  initialRating?: number | null;
  initialTestimonialText?: string | null;
};

export function GroupCompletionPanel({
  levelId,
  groupId,
  groupTitle,
  initialScore,
  initialAiFeedback,
  testimonialSubmitted: initialTestimonialSubmitted,
  initialRating,
  initialTestimonialText,
}: GroupCompletionPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loadingAi, setLoadingAi] = useState(
    !initialTestimonialSubmitted &&
      (initialScore == null || initialAiFeedback == null)
  );
  const [scorePercent, setScorePercent] = useState<number | null>(
    initialScore ?? null
  );
  const [aiFeedback, setAiFeedback] = useState<string | null>(
    initialAiFeedback ?? null
  );
  const [testimonialSubmitted, setTestimonialSubmitted] = useState(
    initialTestimonialSubmitted
  );
  const [rating, setRating] = useState<number | null>(initialRating ?? null);
  const [text, setText] = useState(initialTestimonialText ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pointsAdded, setPointsAdded] = useState(0);
  const [newBadges, setNewBadges] = useState<BadgeWithMeta[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const fetchCompletion = useCallback(
    async (force = false) => {
      if (testimonialSubmitted) return;
      if (!force && scorePercent != null && aiFeedback != null) return;

      setLoadingAi(true);
      setLoadError(null);

      try {
        const result = await prepareGroupCompletion(groupId, levelId);
        setScorePercent(result.scorePercent);
        setAiFeedback(result.aiFeedback);
        if (result.testimonialSubmitted) {
          setTestimonialSubmitted(true);
        }
      } catch {
        setLoadError(labels.student.completionLoadFailed);
      } finally {
        setLoadingAi(false);
      }
    },
    [groupId, levelId, testimonialSubmitted, scorePercent, aiFeedback]
  );

  useEffect(() => {
    if (testimonialSubmitted) return;
    if (initialScore != null && initialAiFeedback != null) return;

    let cancelled = false;

    void (async () => {
      setLoadingAi(true);
      setLoadError(null);
      try {
        const result = await prepareGroupCompletion(groupId, levelId);
        if (cancelled) return;
        setScorePercent(result.scorePercent);
        setAiFeedback(result.aiFeedback);
        if (result.testimonialSubmitted) {
          setTestimonialSubmitted(true);
        }
      } catch {
        if (!cancelled) {
          setLoadError(labels.student.completionLoadFailed);
        }
      } finally {
        if (!cancelled) setLoadingAi(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    groupId,
    levelId,
    initialScore,
    initialAiFeedback,
    testimonialSubmitted,
  ]);

  const textValid = text.trim().length >= 20;
  const canSubmit =
    !testimonialSubmitted && rating != null && textValid && !pending;

  async function handleSubmitTestimonial() {
    if (!canSubmit || rating == null) return;
    setError(null);

    startTransition(async () => {
      const result = await submitGroupTestimonial(
        groupId,
        levelId,
        rating,
        text.trim()
      );

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setTestimonialSubmitted(true);
      setPointsAdded(result.pointsAdded);
      notifyProgressRewards(result, () => router.refresh());

      if (result.newBadges.length > 0) {
        setNewBadges(result.newBadges);
        setShowCelebration(true);
      }

      router.refresh();
    });
  }

  async function handleCelebrationClose() {
    setShowCelebration(false);
    if (newBadges.length > 0) {
      await markBadgesNotified(newBadges.map((b) => b.badgeKey));
    }
  }

  return (
    <>
      <BadgeCelebrationModal
        newBadges={newBadges}
        open={showCelebration}
        onClose={handleCelebrationClose}
      />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-4 sm:px-4 sm:py-6">
        <div className="surface-card-featured mx-auto flex w-full max-w-xl flex-col gap-5 p-4 sm:gap-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-success/15">
            <Trophy className="size-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold">{labels.student.quizComplete}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{groupTitle}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {labels.student.completionScore}
          </p>
          {loadError ? (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-destructive" role="alert">
                {loadError}
              </p>
              <Button
                type="button"
                variant="outline"
                className="min-h-11 gap-2"
                disabled={loadingAi}
                onClick={() => void fetchCompletion(true)}
              >
                {loadingAi ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                {labels.student.retryLoad}
              </Button>
            </div>
          ) : loadingAi && scorePercent == null ? (
            <div className="mt-3 flex justify-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <p className="mt-2 text-4xl font-bold tabular-nums text-primary sm:text-5xl">
              {labels.student.completionScoreLabel(scorePercent ?? 0)}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {labels.student.aiCompletionFeedback}
            </p>
          </div>
          {loadingAi && !aiFeedback && !loadError ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {labels.student.aiCompletionLoading}
            </div>
          ) : loadError && !aiFeedback ? (
            <p className="text-sm text-muted-foreground">
              {labels.api.feedbackUnavailable}
            </p>
          ) : (
            <p className="text-sm leading-relaxed">{aiFeedback}</p>
          )}
        </div>

        {!testimonialSubmitted ? (
          <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <div>
              <h3 className="font-semibold">{labels.student.testimonialTitle}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {labels.student.testimonialSubtitle}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">
                {labels.student.testimonialRatingLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                    onClick={() => setRating(value)}
                    className={cn(
                      "flex size-11 items-center justify-center rounded-md transition-colors",
                      rating != null && value <= rating
                        ? "text-amber-500"
                        : "text-muted-foreground hover:text-amber-400"
                    )}
                  >
                    <Star
                      className={cn(
                        "size-7 sm:size-8",
                        rating != null && value <= rating && "fill-current"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={labels.student.testimonialPlaceholder}
                rows={4}
                disabled={pending}
              />
              {!textValid && text.length > 0 && (
                <p className="mt-1 text-xs text-destructive">
                  {labels.student.testimonialMinLength}
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button
              className="min-h-11 w-full gap-2"
              disabled={!canSubmit}
              onClick={handleSubmitTestimonial}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Star className="size-4" />
              )}
              {pending
                ? labels.student.testimonialSubmitting
                : labels.student.submitTestimonial}
            </Button>
          </div>
        ) : (
          <div className="space-y-3 text-center">
            <p className="text-sm font-medium text-success">
              {labels.student.testimonialThankYou}
            </p>
            {pointsAdded > 0 && (
              <p className="text-points font-medium">
                {labels.student.pointsAdded(pointsAdded)}
              </p>
            )}
            {newBadges.length > 0 && !showCelebration && (
              <p className="text-sm font-medium text-primary">
                {labels.badges.badgesNew(newBadges.length)}
              </p>
            )}
          </div>
        )}

        <Button
          className="min-h-11 w-full gap-2"
          variant={testimonialSubmitted ? "default" : "outline"}
          disabled={!testimonialSubmitted}
          onClick={() => router.push(`/dashboard/learn/${levelId}`)}
        >
          <ArrowLeft className="size-4" />
          {labels.student.backToLevel}
        </Button>

        {!testimonialSubmitted && (
          <p className="text-center text-xs text-muted-foreground">
            {labels.student.testimonialRequired}
          </p>
        )}
        </div>
      </div>
    </>
  );
}
