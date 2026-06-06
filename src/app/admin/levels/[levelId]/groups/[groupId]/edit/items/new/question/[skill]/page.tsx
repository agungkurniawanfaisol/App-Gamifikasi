import { redirect } from "next/navigation";
import { newQuestionPath } from "@/lib/content-routes";

export default function LegacyQuestionSkillPage({
  params,
}: {
  params: { levelId: string; groupId: string };
}) {
  redirect(
    newQuestionPath(parseInt(params.levelId, 10), parseInt(params.groupId, 10))
  );
}
