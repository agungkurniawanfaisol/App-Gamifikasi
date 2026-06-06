"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, Star, MessageSquareQuote } from "lucide-react";
import type { TestimonialListItem } from "@/lib/testimonial-queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  ResponsiveTable,
  ResponsiveTableCard,
} from "@/components/ui/responsive-table";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={cn(
            "size-4",
            value <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

function TestimonialDetailDialog({
  selected,
  onClose,
}: {
  selected: TestimonialListItem | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={selected != null} onOpenChange={onClose}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        {selected && (
          <>
            <DialogHeader>
              <DialogTitle>{selected.studentName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{selected.levelLabel}</Badge>
                <Badge variant="outline">{selected.groupTitle}</Badge>
                {selected.scorePercent != null && (
                  <Badge>{`${selected.scorePercent}%`}</Badge>
                )}
              </div>
              <StarRating rating={selected.rating} />
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {labels.admin.testimonialText}
                </p>
                <p className="leading-relaxed">{selected.testimonialText}</p>
              </div>
              {selected.aiFeedback && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {labels.admin.testimonialAiFeedback}
                  </p>
                  <p className="leading-relaxed text-muted-foreground">
                    {selected.aiFeedback}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function TestimonialList({
  testimonials,
  groupOptions,
}: {
  testimonials: TestimonialListItem[];
  groupOptions: { id: number; title: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<TestimonialListItem | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const groupFilter = searchParams.get("groupId") ?? "all";

  function setFilters(next: { q?: string; groupId?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.q !== undefined) {
      if (!next.q.trim()) params.delete("q");
      else params.set("q", next.q.trim());
    }
    if (next.groupId !== undefined) {
      if (next.groupId === "all") params.delete("groupId");
      else params.set("groupId", next.groupId);
    }
    const qs = params.toString();
    router.push(qs ? `/admin/testimonials?${qs}` : "/admin/testimonials");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="surface-elevated flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={labels.admin.testimonialSearchPlaceholder}
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setFilters({ q: searchInput });
              }
            }}
          />
        </div>
        <select
          value={groupFilter}
          onChange={(e) => setFilters({ groupId: e.target.value })}
          className="native-select h-10 w-full sm:w-56"
        >
          <option value="all">{labels.admin.filterAll}</option>
          {groupOptions.map((group) => (
            <option key={group.id} value={String(group.id)}>
              {group.title}
            </option>
          ))}
        </select>
        <Button
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={() => setFilters({ q: searchInput })}
        >
          {labels.common.search}
        </Button>
      </div>

      {testimonials.length === 0 ? (
        <EmptyState
          icon={MessageSquareQuote}
          title={labels.admin.testimonialEmpty}
        />
      ) : (
        <ResponsiveTable
          mobile={testimonials.map((item) => (
            <ResponsiveTableCard key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.studentName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.studentEmail}
                  </p>
                </div>
                {item.scorePercent != null && (
                  <Badge variant="secondary">{`${item.scorePercent}%`}</Badge>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline">{item.levelLabel}</Badge>
                <Badge variant="outline">{item.groupTitle}</Badge>
              </div>
              <div className="mt-3">
                <StarRating rating={item.rating} />
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                {item.testimonialText}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {item.submittedAt.toLocaleDateString()}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => setSelected(item)}
              >
                {labels.admin.testimonialViewDetails}
              </Button>
            </ResponsiveTableCard>
          ))}
          desktop={
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">{labels.admin.testimonialStudent}</th>
                    <th className="px-4 py-3">{labels.admin.testimonialLevel}</th>
                    <th className="px-4 py-3">{labels.admin.testimonialGroup}</th>
                    <th className="px-4 py-3">{labels.admin.testimonialScore}</th>
                    <th className="px-4 py-3">{labels.admin.testimonialRating}</th>
                    <th className="px-4 py-3">{labels.admin.testimonialText}</th>
                    <th className="px-4 py-3">{labels.admin.testimonialDate}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {testimonials.map((item) => (
                    <tr key={item.id} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.studentName}</p>
                        <p className="text-xs text-muted-foreground">{item.studentEmail}</p>
                      </td>
                      <td className="px-4 py-3">{item.levelLabel}</td>
                      <td className="px-4 py-3">{item.groupTitle}</td>
                      <td className="px-4 py-3">
                        {item.scorePercent != null ? `${item.scorePercent}%` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StarRating rating={item.rating} />
                      </td>
                      <td className="max-w-xs px-4 py-3">
                        <p className="line-clamp-2 text-muted-foreground">
                          {item.testimonialText}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.submittedAt.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelected(item)}
                        >
                          {labels.admin.testimonialViewDetails}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        />
      )}

      <TestimonialDetailDialog
        selected={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
