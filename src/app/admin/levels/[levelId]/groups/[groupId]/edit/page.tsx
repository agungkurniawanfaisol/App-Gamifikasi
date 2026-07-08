import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AssessmentEditor } from "@/components/admin/assessment-editor";
import { ContentItemList } from "@/components/admin/content-builder/content-item-list";
import { Button } from "@/components/ui/button";
import {
  ScrollableTabsList,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getGroupAssessmentQuestions } from "@/lib/assessments";
import { getGroupContentItems } from "@/lib/group-content";
import { labels } from "@/lib/labels";
import { ArrowLeft } from "lucide-react";

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

  // One SSR: client Tabs switch without a full navigation.
  const [items, assessments] = await Promise.all([
    getGroupContentItems(groupId, levelId),
    getGroupAssessmentQuestions(groupId, levelId),
  ]);

  return (
    <div className="space-y-4">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="min-h-11 w-full gap-2 sm:w-auto"
      >
        <Link href={`/admin/levels/${levelId}/groups`}>
          <ArrowLeft className="size-4" />
          {labels.admin.backToGroups}
        </Link>
      </Button>

      <Tabs defaultValue="assessments" className="space-y-4">
        <ScrollableTabsList>
          <TabsList>
            <TabsTrigger value="assessments" className="min-h-11">
              {labels.admin.editGroupTabAssessments}
            </TabsTrigger>
            <TabsTrigger value="content" className="min-h-11">
              {labels.admin.editGroupTabContent}
            </TabsTrigger>
          </TabsList>
        </ScrollableTabsList>

        <TabsContent value="assessments">
          <AssessmentEditor
            levelId={levelId}
            groupId={groupId}
            pretest={assessments.pretest}
            posttest={assessments.posttest}
          />
        </TabsContent>

        <TabsContent value="content">
          <ContentItemList levelId={levelId} groupId={groupId} items={items} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
