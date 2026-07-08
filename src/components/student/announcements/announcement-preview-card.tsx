import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import {
  getActiveAnnouncementCountForRole,
  getActiveAnnouncementsForRole,
} from "@/lib/announcement-queries";
import { Role } from "@prisma/client";
import { labels } from "@/lib/labels";

export async function AnnouncementPreviewCard({ role }: { role: Role }) {
  const [count, latest] = await Promise.all([
    getActiveAnnouncementCountForRole(role),
    getActiveAnnouncementsForRole(role, 1),
  ]);

  const latestTitle = latest[0]?.title;

  return (
    <Link
      href={role === Role.ADMIN ? "/admin/announcements" : "/dashboard/announcements"}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm transition-all hover:border-violet-500/30 hover:shadow-md"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
        <Megaphone className="size-5 text-violet-600 dark:text-violet-400" />
      </div>
      <div className="min-w-0 flex-1 text-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {labels.announcements.previewTitle}
        </p>
        <p className="font-semibold text-foreground">
          {count > 0
            ? labels.announcements.previewCount(count)
            : labels.announcements.previewNone}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {latestTitle
            ? labels.announcements.previewLatest(latestTitle)
            : labels.announcements.emptyHint}
        </p>
      </div>
      <div className="hidden items-center gap-1 text-xs font-medium text-primary sm:flex">
        {labels.announcements.viewAll}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
