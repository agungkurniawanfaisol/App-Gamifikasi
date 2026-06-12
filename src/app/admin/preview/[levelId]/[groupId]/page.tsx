import { notFound } from "next/navigation";
import { ContentItemType } from "@prisma/client";
import { requireAdmin } from "@/lib/auth-helpers";
import { getContentItemLabel } from "@/lib/content-item";
import { getGroupContentItems } from "@/lib/group-content";
import { MaterialPreview } from "@/components/admin/content-builder/material-preview";
import { QuestionPreview } from "@/components/admin/content-builder/question-preview";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { labels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { Eye } from "lucide-react";

export default async function AdminPreviewPage({
  params,
}: {
  params: { levelId: string; groupId: string };
}) {
  await requireAdmin();
  const levelId = parseInt(params.levelId, 10);
  const groupId = parseInt(params.groupId, 10);

  if (Number.isNaN(levelId) || Number.isNaN(groupId)) notFound();

  const group = await prisma.learningGroup.findFirst({
    where: { id: groupId, levelId },
    select: { title: true, level: { select: { name: true } } },
  });
  if (!group) notFound();

  const items = await getGroupContentItems(groupId, levelId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <Eye className="size-7 text-primary" />
            {labels.admin.previewTitle}
          </span>
        }
        description={labels.admin.previewDescription}
      />

      <Alert>
        <AlertTitle>{labels.admin.previewTitle}</AlertTitle>
        <AlertDescription>{labels.admin.previewBanner}</AlertDescription>
      </Alert>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{group.title}</h2>
        <p className="text-sm text-muted-foreground">{group.level.name}</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{labels.admin.noItemsYet}</p>
      ) : (
        <ol className="space-y-6">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-4 py-3">
                <Badge variant="outline">
                  {labels.admin.stepOf(index + 1, items.length)}
                </Badge>
                <Badge variant="secondary">
                  {item.type === ContentItemType.MATERIAL
                    ? labels.admin.itemMaterial
                    : labels.admin.itemQuestion}
                </Badge>
                <span className="min-w-0 truncate text-sm font-medium">
                  {getContentItemLabel(item)}
                </span>
              </div>
              {item.type === ContentItemType.MATERIAL ? (
                <MaterialPreview
                  title={item.title ?? undefined}
                  content={item.content ?? ""}
                  attachments={item.attachments}
                />
              ) : (
                <QuestionPreview item={item} />
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
