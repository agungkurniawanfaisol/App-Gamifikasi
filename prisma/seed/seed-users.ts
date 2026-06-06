import { Gender, PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function seedUsers(prisma: PrismaClient) {
  const adminHash = await bcrypt.hash("admin123", 10);
  const studentHash = await bcrypt.hash("student123", 10);

  await prisma.user.upsert({
    where: { email: "admin@gamifikasi.com" },
    update: {
      phone: "081234567890",
      institution: "Gamifikasi Admin Office",
      isActive: true,
    },
    create: {
      name: "Admin",
      email: "admin@gamifikasi.com",
      password: adminHash,
      role: Role.ADMIN,
      phone: "081234567890",
      institution: "Gamifikasi Admin Office",
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "student@gamifikasi.com" },
    update: {
      phone: "081298765432",
      dateOfBirth: new Date("2008-05-15"),
      gender: Gender.MALE,
      institution: "SMA Negeri 1 Jakarta",
      studentId: "NIS-2024001",
      isActive: true,
    },
    create: {
      name: "Student",
      email: "student@gamifikasi.com",
      password: studentHash,
      role: Role.STUDENT,
      phone: "081298765432",
      dateOfBirth: new Date("2008-05-15"),
      gender: Gender.MALE,
      institution: "SMA Negeri 1 Jakarta",
      studentId: "NIS-2024001",
      isActive: true,
    },
  });

  console.log("  ✅ Users created");
}
