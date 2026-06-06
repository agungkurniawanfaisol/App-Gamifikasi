import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentItemType } from "@prisma/client";
import { BookOpen, HelpCircle } from "lucide-react";
import { MaterialForm } from "@/components/admin/content-builder/material-form";
import { QuestionForm } from "@/components/admin/content-builder/question-form";
import { getGroupContentItem } from "@/lib/group-content";
import { getContentItemLabel } from "@/lib/content-item";
import { groupEditPath } from "@/lib/content-routes";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { labels } from "@/lib/labels";

export default async function EditContentItemPage({
  params,
}: {
  params: { levelId: string; groupId: string; itemId: string };
}) {
  const levelId = parseInt(params.levelId, 10);
  const groupId = parseInt(params.groupId, 10);
  const itemId = parseInt(params.itemId, 10);

  const item = await getGroupContentItem(itemId, groupId, levelId);
  if (!item) notFound();

  const group = await prisma.learningGroup.findFirst({
    where: { id: groupId, levelId },
    select: { title: true },
  });

  const itemLabel = getContentItemLabel(item);
  const isQuestion = item.type === ContentItemType.QUESTION;
  const Icon = isQuestion ? HelpCircle : BookOpen;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span>{isQuestion ? labels.admin.addQuestion : labels.admin.addMaterial}</span>
            <Badge variant={isQuestion ? "default" : "secondary"} className="gap-1.5">
              <Icon className="size-3.5" />
              {isQuestion ? labels.admin.itemQuestion : labels.admin.itemMaterial}
            </Badge>
          </span>
        }
        description={group ? `${group.title} · ${itemLabel}` : itemLabel}
      >
        <Button variant="outline" asChild>
          <Link href={groupEditPath(levelId, groupId)}>
            {labels.common.back}
          </Link>
        </Button>
      </PageHeader>

      {isQuestion ? (
        <QuestionForm levelId={levelId} groupId={groupId} item={item} />
      ) : (
        <MaterialForm levelId={levelId} groupId={groupId} item={item} />
      )}
    </div>
  );
}
