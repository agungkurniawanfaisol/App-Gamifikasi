import { revalidateTag } from "next/cache";

export function studentCacheTag(
  userId: number,
  scope:
    | "dashboard"
    | "ranking"
    | "proficiency"
    | "challenges"
    | "badges"
    | "rewards"
    | "learn"
) {
  return `student:${userId}:${scope}`;
}

/** Invalidate cached student summaries without re-rendering every dashboard route. */
export function revalidateStudentGamification(userId: number) {
  revalidateTag(studentCacheTag(userId, "dashboard"));
  revalidateTag(studentCacheTag(userId, "ranking"));
  revalidateTag(studentCacheTag(userId, "proficiency"));
  revalidateTag(studentCacheTag(userId, "challenges"));
  revalidateTag(studentCacheTag(userId, "badges"));
  revalidateTag(studentCacheTag(userId, "rewards"));
}
