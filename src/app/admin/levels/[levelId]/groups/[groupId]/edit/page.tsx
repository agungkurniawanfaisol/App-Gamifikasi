import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AssessmentEditor } from "@/components/admin/assessment-editor";
import { ContentItemList } from "@/components/admin/content-builder/content-item-list";
import { getGroupAssessmentQuestions } from "@/lib/assessments";
import { getGroupContentItems } from "@/lib/group-content";

export default async function EditGroupPage({
  params,
}: {
  params: { levelId: string; groupId: string };
}) {
  const levelId = parseInt(params.levelId, 10);
  const groupId = parseInt(params.groupId, 10);

  const group = await prisma.learningGroup.findFirst({
    where: { id: groupId, levelId },
    select: { id: true },
  });
  if (!group) notFound();

  const [items, assessments] = await Promise.all([
    getGroupContentItems(groupId, levelId),
    getGroupAssessmentQuestions(groupId, levelId),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <AssessmentEditor
        levelId={levelId}
        groupId={groupId}
        pretest={assessments.pretest}
        posttest={assessments.posttest}
      />
      <ContentItemList levelId={levelId} groupId={groupId} items={items} />
    </div>
  );
}
