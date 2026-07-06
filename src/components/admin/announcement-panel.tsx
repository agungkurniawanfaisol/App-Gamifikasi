"use client";

import { useState, useTransition } from "react";
import { Megaphone, Pencil, Trash2 } from "lucide-react";
import { Role } from "@prisma/client";
import type { AnnouncementListItem } from "@/actions/admin/announcements";
import {
  createAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementActive,
  updateAnnouncement,
} from "@/actions/admin/announcements";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { labels } from "@/lib/labels";

function formatDateTimeLocal(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDisplayDate(value: Date | string | null): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString();
}

function targetRoleLabel(role: Role | null): string {
  if (role === Role.STUDENT) return labels.admin.announcementsTargetStudent;
  if (role === Role.ADMIN) return labels.admin.announcementsTargetAdmin;
  return labels.admin.announcementsTargetAll;
}

function AnnouncementForm({
  item,
  onDone,
}: {
  item?: AnnouncementListItem;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = item
        ? await updateAnnouncement(item.id, formData)
        : await createAnnouncement(formData);
      if (!result.ok) {
        setError(result.error ?? "Could not save announcement.");
        return;
      }
      onDone();
    });
  }

  return (
    <form action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="announcement-title">
          {labels.admin.announcementsTitleField}
        </Label>
        <Input
          id="announcement-title"
          name="title"
          required
          defaultValue={item?.title ?? ""}
        />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="announcement-message">
          {labels.admin.announcementsMessage}
        </Label>
        <Textarea
          id="announcement-message"
          name="message"
          rows={4}
          required
          defaultValue={item?.message ?? ""}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="announcement-link-url">
          {labels.admin.announcementsLinkUrl}
        </Label>
        <Input
          id="announcement-link-url"
          name="linkUrl"
          type="url"
          defaultValue={item?.linkUrl ?? ""}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="announcement-link-label">
          {labels.admin.announcementsLinkLabel}
        </Label>
        <Input
          id="announcement-link-label"
          name="linkLabel"
          defaultValue={item?.linkLabel ?? ""}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="announcement-starts">
          {labels.admin.announcementsStartsAt}
        </Label>
        <Input
          id="announcement-starts"
          name="startsAt"
          type="datetime-local"
          required
          defaultValue={
            item?.startsAt
              ? formatDateTimeLocal(item.startsAt)
              : formatDateTimeLocal(new Date())
          }
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="announcement-ends">
          {labels.admin.announcementsEndsAt}
        </Label>
        <Input
          id="announcement-ends"
          name="endsAt"
          type="datetime-local"
          defaultValue={formatDateTimeLocal(item?.endsAt)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="announcement-target">
          {labels.admin.announcementsTargetRole}
        </Label>
        <select
          id="announcement-target"
          name="targetRole"
          className="native-select"
          defaultValue={item?.targetRole ?? ""}
        >
          <option value="">{labels.admin.announcementsTargetAll}</option>
          <option value={Role.STUDENT}>
            {labels.admin.announcementsTargetStudent}
          </option>
          <option value={Role.ADMIN}>
            {labels.admin.announcementsTargetAdmin}
          </option>
        </select>
      </div>
      <div className="flex items-center gap-3 self-end">
        <input
          id="announcement-active"
          name="isActive"
          type="checkbox"
          defaultChecked={item?.isActive ?? true}
          className="size-4 rounded border border-input"
        />
        <Label htmlFor="announcement-active">
          {labels.admin.announcementsActive}
        </Label>
      </div>
      {error && (
        <p className="text-sm text-destructive sm:col-span-2" role="alert">
          {error}
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending} className="min-h-11 w-full sm:w-auto">
          {labels.admin.announcementsSave}
        </Button>
      </div>
    </form>
  );
}

export function AnnouncementPanel({
  announcements,
}: {
  announcements: AnnouncementListItem[];
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<AnnouncementListItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  function handleToggle(id: number, isActive: boolean) {
    startTransition(async () => {
      await toggleAnnouncementActive(id, isActive);
    });
  }

  function handleDelete(id: number) {
    if (!window.confirm(labels.admin.announcementsDeleteConfirm)) return;
    startTransition(async () => {
      await deleteAnnouncement(id);
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <CardTitle className="text-base">
            {labels.admin.announcementsCreate}
          </CardTitle>
          <Button
            type="button"
            className="min-h-11 w-full sm:w-auto"
            onClick={() => setCreateOpen(true)}
          >
            {labels.admin.announcementsCreate}
          </Button>
        </CardHeader>
      </Card>

      {announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title={labels.admin.announcementsEmpty}>
          <Button
            type="button"
            className="min-h-11"
            onClick={() => setCreateOpen(true)}
          >
            {labels.admin.announcementsCreate}
          </Button>
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((item) => (
            <div key={item.id} className="surface-card overflow-hidden">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold">{item.title}</h3>
                    <Badge variant="secondary">
                      {targetRoleLabel(item.targetRole)}
                    </Badge>
                    <Badge variant={item.isActive ? "default" : "outline"}>
                      {item.isActive
                        ? labels.admin.announcementsActive
                        : labels.admin.announcementsInactive}
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.message}
                  </p>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-4">
                    <span>
                      {labels.admin.announcementsStartsAt}:{" "}
                      {formatDisplayDate(item.startsAt)}
                    </span>
                    <span>
                      {labels.admin.announcementsEndsAt}:{" "}
                      {formatDisplayDate(item.endsAt)}
                    </span>
                  </div>
                  {item.linkUrl && (
                    <p className="truncate text-xs text-primary">
                      {item.linkLabel ?? item.linkUrl}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 self-end sm:self-auto">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="min-h-11"
                    disabled={pending}
                    onClick={() => setEditing(item)}
                  >
                    <Pencil className="size-4" />
                    {labels.common.edit}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="min-h-11"
                    disabled={pending}
                    onClick={() => handleToggle(item.id, !item.isActive)}
                  >
                    {item.isActive
                      ? labels.admin.announcementsInactive
                      : labels.admin.announcementsActive}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="min-h-11"
                    disabled={pending}
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="size-4" />
                    {labels.common.delete}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{labels.admin.announcementsCreate}</DialogTitle>
          </DialogHeader>
          <AnnouncementForm onDone={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={editing != null} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{labels.admin.announcementsEdit}</DialogTitle>
          </DialogHeader>
          {editing && (
            <AnnouncementForm item={editing} onDone={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
