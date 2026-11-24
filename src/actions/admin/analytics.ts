"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { buildAdminAnalyticsSnapshot } from "@/lib/admin-analytics";
import {
  buildStudentAnswerReviewRoster,
  STUDENT_ANSWER_REVIEW_PAGE_SIZE,
} from "@/lib/admin-student-answer-review";

export async function fetchAdminAnalytics() {
  await requireAdmin();
  return buildAdminAnalyticsSnapshot();
}

export async function fetchStudentAnswerReview(
  page = 1,
  pageSize = STUDENT_ANSWER_REVIEW_PAGE_SIZE
) {
  await requireAdmin();
  return buildStudentAnswerReviewRoster(page, pageSize);
}
