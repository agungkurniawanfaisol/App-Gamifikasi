import { PrismaClient } from "@prisma/client";
import { SEED_SCALE } from "./seed/config";
import { seedGroupAssessments } from "./seed/seed-assessments";
import { seedLeaderboardDemo } from "./seed/seed-leaderboard";
import { seedLevels } from "./seed/seed-levels";
import { seedStudentProgress } from "./seed/seed-progress";
import { seedRewards } from "./seed/seed-rewards";
import { seedUsers } from "./seed/seed-users";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await seedUsers(prisma);
  await seedLeaderboardDemo(prisma);
  const stats = await seedLevels(prisma);
  await seedGroupAssessments(prisma);
  await seedRewards(prisma);
  await seedStudentProgress(prisma);

  console.log("");
  console.log("📊 Seed summary:");
  console.log("  Users: 2 (admin + student) + leaderboard demo students");
  console.log("  Levels: 3");
  console.log(
    `  Groups: ${stats.totalGroups} total (${SEED_SCALE.groupsPerLevel} per level)`
  );
  console.log(
    `  Content items: ${stats.totalItems} (${SEED_SCALE.materialsPerGroup}M + ${SEED_SCALE.questionsPerGroup}Q per group)`
  );
  console.log(`  Question items: ${stats.totalQuestions}`);
  console.log(`  Sub-questions: ${stats.totalSubQuestions}`);
  console.log("");
  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
