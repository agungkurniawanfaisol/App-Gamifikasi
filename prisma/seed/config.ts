import { LevelName } from "@prisma/client";

export const SEED_SCALE = {
  groupsPerLevel: 15,
  materialsPerGroup: 10,
  questionsPerGroup: 5,
  subQuestionsMin: 2,
  subQuestionsMax: 4,
} as const;

export const LEVEL_DATA = [
  {
    name: LevelName.BASIC,
    order: 1,
    description: "Beginner level — fundamentals of English",
  },
  {
    name: LevelName.INTERMEDIATE,
    order: 2,
    description: "Intermediate level — building fluency",
  },
  {
    name: LevelName.HARD,
    order: 3,
    description: "Advanced level — mastery",
  },
] as const;

/** Material slots (1-based order) within a 15-item group */
export const MATERIAL_SLOTS = [1, 2, 4, 5, 6, 8, 9, 11, 12, 14] as const;

/** Question slots (1-based order) within a 15-item group */
export const QUESTION_SLOTS = [3, 7, 10, 13, 15] as const;

export const LEGACY_GROUPS_PER_LEVEL = 3;
