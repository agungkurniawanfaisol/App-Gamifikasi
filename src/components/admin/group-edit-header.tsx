"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Check, Columns2, Crown, Eye, LayoutList, Layers, Loader2, PenLine, Type } from "lucide-react";
import { updateGroup } from "@/actions/admin/groups";
import { groupEditPath } from "@/lib/content-routes";
import { Button } from "@/components/ui/button";
import { IconButtonTooltip } from "@/components/ui/icon-button-tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { useViewMode } from "@/lib/view-mode-context";

export function GroupEditHeader({
  levelId,
  groupId,
  title: initialTitle,
  dueAt: initialDueAt,
  isPremium: initialIsPremium,
}: {
  levelId: number;
  groupId: number;
  title: string;
  dueAt: string | null;
  isPremium: boolean;
}) {
  const pathname = usePathname();
  const contentsPath = groupEditPath(levelId, groupId);
  const isContentsPage = pathname === contentsPath;
  const isEditItemPage = pathname.includes("/edit/items/");
  const { viewMode, setViewMode } = useViewMode();

  const [title, setTitle] = useState(initialTitle);
  const [dueAt, setDueAt] = useState(initialDueAt ?? "");
  const [isPremium, setIsPremium] = useState(initialIsPremium);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const trimmedTitle = title.trim();
  const dirty =
    trimmedTitle !== initialTitle.trim() ||
    dueAt !== (initialDueAt ?? "") ||
    isPremium !== initialIsPremium;
  const canSave = dirty && trimmedTitle.length > 0 && !pending;

  useEffect(() => {
    setTitle(initialTitle);
    setDueAt(initialDueAt ?? "");
    setIsPremium(initialIsPremium);
  }, [initialTitle, initialDueAt, initialIsPremium]);

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 2000);
    return () => window.clearTimeout(timer);
  }, [saved]);

  function handleSave(formData: FormData) {
    startTransition(async () => {
      await updateGroup(groupId, levelId, formData);
      setSaved(true);
    });
  }

  return (
    <div className="surface-elevated overflow-hidden">
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {labels.admin.manageContent}
              </p>
              <h2 className="truncate text-lg font-bold tracking-tight sm:text-xl">
                {initialTitle}
              </h2>
            </div>
          </div>

          {isEditItemPage && (
            <div
              className="flex shrink-0 items-center gap-0.5 self-end rounded-lg border border-border bg-muted/30 p-0.5 sm:self-auto"
              role="group"
              aria-label={labels.admin.editorViewMode}
            >
              {([
                { mode: "editor" as const, icon: PenLine, label: "Editor" },
                { mode: "split" as const, icon: Columns2, label: "Split" },
                { mode: "preview" as const, icon: Eye, label: "Preview" },
              ]).map(({ mode: m, icon: Icon, label }) => (
                <IconButtonTooltip key={m} label={label}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setViewMode(m)}
                    aria-label={label}
                    className={cn(
                      "size-9 sm:w-auto sm:px-3",
                      viewMode === m && "bg-background shadow-sm"
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span className="hidden text-xs sm:inline">{label}</span>
                  </Button>
                </IconButtonTooltip>
              ))}
            </div>
          )}
        </div>

        <form
          action={handleSave}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1 space-y-1.5">
              <Label
                htmlFor="group-title"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                <Type className="size-3.5" />
                {labels.admin.groupTitle}
              </Label>
              <Input
                id="group-title"
                name="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSaved(false);
                }}
                placeholder={labels.admin.groupTitlePlaceholder}
                className="h-11 bg-background text-base sm:text-sm"
                autoComplete="off"
              />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <Label
                htmlFor="group-due-at"
                className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {labels.points.dueAt}
              </Label>
              <Input
                id="group-due-at"
                name="dueAt"
                type="datetime-local"
                value={dueAt}
                onChange={(e) => {
                  setDueAt(e.target.value);
                  setSaved(false);
                }}
                className="h-11 bg-background text-base sm:text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                {labels.points.dueAtHint}
              </p>
            </div>

            <div className="flex min-w-0 flex-1 items-end">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/70 bg-muted/20 px-4 py-3">
                <input
                  type="checkbox"
                  name="isPremium"
                  checked={isPremium}
                  onChange={(e) => {
                    setIsPremium(e.target.checked);
                    setSaved(false);
                  }}
                  className="mt-0.5 size-4 rounded border-border accent-primary"
                />
                <div>
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <Crown className="size-4 text-amber-600 dark:text-amber-400" />
                    {labels.admin.premiumContent}
                  </span>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {labels.admin.premiumContentHint}
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <IconButtonTooltip label={labels.admin.saveTitle}>
              <Button
                type="submit"
                size="icon"
                disabled={!canSave}
                variant={canSave ? "default" : "outline"}
                aria-label={labels.admin.saveTitle}
                className={cn(
                  "size-11 shrink-0 transition-colors",
                  saved && "bg-success text-success-foreground hover:bg-success/90"
                )}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
              </Button>
            </IconButtonTooltip>

            {isContentsPage ? (
              <IconButtonTooltip label={labels.admin.groupContents}>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  aria-label={labels.admin.groupContents}
                  aria-current="page"
                  className="size-11 shrink-0"
                >
                  <LayoutList className="size-4" />
                </Button>
              </IconButtonTooltip>
            ) : (
              <IconButtonTooltip label={labels.admin.groupContents}>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  asChild
                  aria-label={labels.admin.groupContents}
                  className="size-11 shrink-0"
                >
                  <Link href={contentsPath}>
                    <LayoutList className="size-4" />
                  </Link>
                </Button>
              </IconButtonTooltip>
            )}
          </div>
        </form>

        {dirty && (
          <p className="text-xs text-muted-foreground">
            {labels.admin.unsavedTitleHint}
          </p>
        )}
      </div>
    </div>
  );
}
