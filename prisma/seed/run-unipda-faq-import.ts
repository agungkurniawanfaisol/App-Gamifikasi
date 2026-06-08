import { PrismaClient } from "@prisma/client";
import { seedUnipdaFaqKnowledge } from "./seed-unipda-faq-knowledge";

const prisma = new PrismaClient();

seedUnipdaFaqKnowledge(prisma)
  .then(() => {
    console.log("✅ UNIPDA FAQ import selesai");
  })
  .catch((error) => {
    console.error("❌ UNIPDA FAQ import gagal:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
