import { redirect } from "next/navigation";

export default function QuizRedirectPage({
  params,
}: {
  params: { levelId: string; groupId: string };
}) {
  redirect(`/dashboard/learn/${params.levelId}/${params.groupId}`);
}
