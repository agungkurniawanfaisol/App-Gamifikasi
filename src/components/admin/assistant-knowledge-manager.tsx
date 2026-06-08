"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BookOpen, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  createAssistantKnowledgeEntry,
  deleteAssistantKnowledgeEntry,
  toggleAssistantKnowledgePublish,
  updateAssistantKnowledgeEntry,
} from "@/actions/admin/assistant-knowledge";
import type { AssistantKnowledgeListItem } from "@/lib/assistant-knowledge-admin";
import { labels } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormattedDateTime } from "@/components/ui/formatted-date-time";
import { ListPagination } from "@/components/ui/list-pagination";

type EntryFormProps = {
  entry?: AssistantKnowledgeListItem;
  onSubmit: (formData: FormData) => void;
  pending: boolean;
  error: string | null;
};

function EntryForm({ entry, onSubmit, pending, error }: EntryFormProps) {
  return (
    <form action={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="slug">{labels.admin.assistantKnowledgeSlug}</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={entry?.slug ?? ""}
            placeholder={labels.admin.assistantKnowledgeSlugPlaceholder}
            required
            className="min-h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">{labels.admin.assistantKnowledgePriority}</Label>
          <Input
            id="priority"
            name="priority"
            type="number"
            min={0}
            max={1000}
            defaultValue={entry?.priority ?? 0}
            className="min-h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="keywords">{labels.admin.assistantKnowledgeKeywords}</Label>
        <Textarea
          id="keywords"
          name="keywords"
          defaultValue={entry?.keywords.join(", ") ?? ""}
          placeholder={labels.admin.assistantKnowledgeKeywordsPlaceholder}
          rows={2}
          required
        />
        <p className="text-xs text-muted-foreground">
          {labels.admin.assistantKnowledgeKeywordsHint}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="questionEn">{labels.admin.assistantKnowledgeQuestionEn}</Label>
          <Textarea
            id="questionEn"
            name="questionEn"
            defaultValue={entry?.questionEn ?? ""}
            rows={3}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="questionId">{labels.admin.assistantKnowledgeQuestionId}</Label>
          <Textarea
            id="questionId"
            name="questionId"
            defaultValue={entry?.questionId ?? ""}
            rows={3}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="answerEn">{labels.admin.assistantKnowledgeAnswerEn}</Label>
          <Textarea
            id="answerEn"
            name="answerEn"
            defaultValue={entry?.answerEn ?? ""}
            rows={5}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="answerId">{labels.admin.assistantKnowledgeAnswerId}</Label>
          <Textarea
            id="answerId"
            name="answerId"
            defaultValue={entry?.answerId ?? ""}
            rows={5}
          />
        </div>
      </div>

      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={entry?.isPublished ?? true}
          className="size-4 rounded border-input"
        />
        {labels.admin.assistantKnowledgePublished}
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
        <Button type="submit" disabled={pending} className="min-h-11 w-full sm:w-auto">
          {entry
            ? labels.admin.assistantKnowledgeSave
            : labels.admin.assistantKnowledgeCreate}
        </Button>
      </DialogFooter>
    </form>
  );
}

type PaginationState = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  search?: string;
};

export function AssistantKnowledgeManager({
  entries: initialEntries,
  pagination,
}: {
  entries: AssistantKnowledgeListItem[];
  pagination: PaginationState;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<AssistantKnowledgeListItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleCreate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createAssistantKnowledgeEntry(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCreateOpen(false);
      router.refresh();
    });
  }

  function handleUpdate(formData: FormData) {
    if (!editEntry) return;
    setError(null);
    startTransition(async () => {
      const result = await updateAssistantKnowledgeEntry(editEntry.id, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditEntry(null);
      router.refresh();
    });
  }

  function handleDelete(id: number) {
    if (!window.confirm(labels.admin.assistantKnowledgeDeleteConfirm)) return;
    startTransition(async () => {
      const result = await deleteAssistantKnowledgeEntry(id);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function handleTogglePublish(entry: AssistantKnowledgeListItem) {
    startTransition(async () => {
      const result = await toggleAssistantKnowledgePublish(entry.id, !entry.isPublished);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") ?? "").trim();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    const href = params.toString()
      ? `/admin/assistant-knowledge?${params.toString()}`
      : "/admin/assistant-knowledge";
    router.push(href);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {labels.admin.assistantKnowledgeHint}
        </p>
        <Button
          type="button"
          onClick={() => {
            setError(null);
            setCreateOpen(true);
          }}
          className="min-h-11 w-full sm:w-auto"
        >
          <Plus className="size-4" />
          {labels.admin.assistantKnowledgeAdd}
        </Button>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={pagination.search ?? ""}
            placeholder={labels.admin.assistantKnowledgeSearchPlaceholder}
            className="min-h-11 pl-10"
          />
        </div>
        <Button type="submit" variant="outline" className="min-h-11 w-full sm:w-auto">
          {labels.common.search}
        </Button>
      </form>

      {error && !createOpen && !editEntry && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {initialEntries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={
            pagination.search
              ? labels.admin.assistantKnowledgeSearchEmpty
              : labels.admin.assistantKnowledgeEmpty
          }
          description={
            pagination.search
              ? labels.admin.assistantKnowledgeSearchEmptyHint
              : labels.admin.assistantKnowledgeEmptyHint
          }
        />
      ) : (
        <div className="space-y-3">
          {initialEntries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg border border-border bg-card p-4 sm:p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{entry.slug}</h3>
                    <Badge variant={entry.isPublished ? "default" : "outline"}>
                      {entry.isPublished
                        ? labels.status.published
                        : labels.status.draft}
                    </Badge>
                    <Badge variant="secondary">
                      {labels.admin.assistantKnowledgePriorityValue(entry.priority)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.questionEn}</p>
                  {entry.questionId && (
                    <p className="text-sm text-muted-foreground">{entry.questionId}</p>
                  )}
                  <p className="line-clamp-2 text-sm">{entry.answerEn}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.keywords.map((keyword) => (
                      <Badge key={keyword} variant="outline" className="font-normal">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {labels.admin.assistantKnowledgeUpdated}{" "}
                    <FormattedDateTime value={entry.updatedAt} />
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11"
                    onClick={() => {
                      setError(null);
                      setEditEntry(entry);
                    }}
                  >
                    <Pencil className="size-4" />
                    {labels.common.edit}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11"
                    onClick={() => handleTogglePublish(entry)}
                    disabled={pending}
                  >
                    {entry.isPublished
                      ? labels.admin.assistantKnowledgeUnpublish
                      : labels.admin.assistantKnowledgePublish}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="min-h-11"
                    onClick={() => handleDelete(entry.id)}
                    disabled={pending}
                  >
                    <Trash2 className="size-4" />
                    {labels.common.delete}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <ListPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            pageSize={pagination.pageSize}
            pathname="/admin/assistant-knowledge"
            searchParams={pagination.search ? { q: pagination.search } : undefined}
          />
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{labels.admin.assistantKnowledgeCreateTitle}</DialogTitle>
          </DialogHeader>
          <EntryForm onSubmit={handleCreate} pending={pending} error={error} />
        </DialogContent>
      </Dialog>

      <Dialog open={editEntry != null} onOpenChange={(open) => !open && setEditEntry(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{labels.admin.assistantKnowledgeEditTitle}</DialogTitle>
          </DialogHeader>
          {editEntry && (
            <EntryForm
              entry={editEntry}
              onSubmit={handleUpdate}
              pending={pending}
              error={error}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
