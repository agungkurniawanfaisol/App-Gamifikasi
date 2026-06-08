import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

export type ListPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  pathname: string;
  searchParams?: Record<string, string | undefined>;
  className?: string;
};

function buildPageHref(
  pathname: string,
  page: number,
  searchParams?: Record<string, string | undefined>
): string {
  const params = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value?.trim()) params.set(key, value.trim());
    }
  }
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function ListPagination({
  page,
  totalPages,
  total,
  pageSize,
  pathname,
  searchParams,
  className,
}: ListPaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const prevHref = buildPageHref(pathname, page - 1, searchParams);
  const nextHref = buildPageHref(pathname, page + 1, searchParams);

  return (
    <nav
      aria-label={labels.common.paginationNav}
      className={cn(
        "flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        {labels.common.paginationShowing(from, to, total)}
      </p>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-3">
        <p className="text-center text-sm text-muted-foreground sm:text-right">
          {labels.common.paginationPage(page, totalPages)}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          {page <= 1 ? (
            <Button
              type="button"
              variant="outline"
              disabled
              className="min-h-11 w-full sm:w-auto"
            >
              <ChevronLeft className="size-4" />
              {labels.common.paginationPrevious}
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
            >
              <Link href={prevHref}>
                <ChevronLeft className="size-4" />
                {labels.common.paginationPrevious}
              </Link>
            </Button>
          )}

          {page >= totalPages ? (
            <Button
              type="button"
              variant="outline"
              disabled
              className="min-h-11 w-full sm:w-auto"
            >
              {labels.common.paginationNext}
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
            >
              <Link href={nextHref}>
                {labels.common.paginationNext}
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
