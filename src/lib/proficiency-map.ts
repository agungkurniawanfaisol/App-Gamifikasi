import type { ProficiencyLevelName as AppProficiencyLevelName } from "@/lib/proficiency";

export type PrismaProficiencyLevel =
  | "BEGINNER"
  | "ELEMENTARY"
  | "INTERMEDIATE"
  | "UPPER_INTERMEDIATE"
  | "ADVANCED";

const APP_TO_PRISMA: Record<AppProficiencyLevelName, PrismaProficiencyLevel> = {
  beginner: "BEGINNER",
  elementary: "ELEMENTARY",
  intermediate: "INTERMEDIATE",
  upper_intermediate: "UPPER_INTERMEDIATE",
  advanced: "ADVANCED",
};

export function toPrismaProficiencyLevel(
  name: AppProficiencyLevelName
): PrismaProficiencyLevel {
  return APP_TO_PRISMA[name];
}

export function prismaProficiencyLabel(level: PrismaProficiencyLevel): string {
  return level
    .toLowerCase()
    .split("_")
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
