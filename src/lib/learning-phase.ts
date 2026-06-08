import type {
  AssessmentAnswerRecord,
  AssessmentQuestionPayload,
} from "@/lib/assessments";
import { isAssessmentPhaseComplete } from "@/lib/assessments";

export type LearningPhase = "pretest" | "content" | "posttest" | "finished";

export function resolveInitialPhase(
  pretest: AssessmentQuestionPayload[],
  posttest: AssessmentQuestionPayload[],
  pretestAnswers: AssessmentAnswerRecord[],
  posttestAnswers: AssessmentAnswerRecord[],
  contentComplete: boolean,
  groupCompleted: boolean
): LearningPhase {
  if (groupCompleted) return "finished";
  if (!isAssessmentPhaseComplete(pretest, pretestAnswers)) return "pretest";
  if (!contentComplete) return "content";
  if (!isAssessmentPhaseComplete(posttest, posttestAnswers)) return "posttest";
  return "finished";
}
