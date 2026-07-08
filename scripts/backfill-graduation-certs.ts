#!/usr/bin/env tsx
// Issue graduation certificates for students who already completed every level.
// Usage: npx tsx scripts/backfill-graduation-certs.ts

import { PrismaClient } from "@prisma/client";
import {
  evaluateAchievements,
  isProgramComplete,
} from "../src/lib/achievement-engine";

const prisma = new PrismaClient();

async function main() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, email: true },
  });

  let issued = 0;

  for (const student of students) {
    const eligible = await isProgramComplete(student.id);
    if (!eligible) continue;

    const grants = await evaluateAchievements(student.id, {
      type: "PROGRAM_COMPLETE",
    });

    if (grants.length > 0) {
      issued += 1;
      console.log(`Issued graduation certificate for ${student.email}`);
    }
  }

  console.log(`Done. ${issued} graduation certificate(s) issued.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
