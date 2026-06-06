import { Gender, PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const DEMO_STUDENTS = [
  {
    name: "Aisha Rahma",
    email: "aisha@gamifikasi.com",
    points: 820,
    institution: "SMA Negeri 2 Bandung",
    studentId: "NIS-2024010",
  },
  {
    name: "Budi Santoso",
    email: "budi@gamifikasi.com",
    points: 640,
    institution: "SMA Negeri 5 Surabaya",
    studentId: "NIS-2024011",
  },
  {
    name: "Citra Dewi",
    email: "citra@gamifikasi.com",
    points: 510,
    institution: "SMA Negeri 3 Yogyakarta",
    studentId: "NIS-2024012",
  },
  {
    name: "Dian Pratama",
    email: "dian@gamifikasi.com",
    points: 420,
    institution: "SMA Negeri 1 Jakarta",
    studentId: "NIS-2024013",
  },
  {
    name: "Eko Wijaya",
    email: "eko@gamifikasi.com",
    points: 280,
    institution: "SMA Negeri 8 Malang",
    studentId: "NIS-2024014",
  },
  {
    name: "Farah Lestari",
    email: "farah@gamifikasi.com",
    points: 190,
    institution: "SMA Negeri 4 Semarang",
    studentId: "NIS-2024015",
  },
  {
    name: "Gilang Mahendra",
    email: "gilang@gamifikasi.com",
    points: 120,
    institution: "SMA Negeri 2 Medan",
    studentId: "NIS-2024016",
  },
  {
    name: "Hana Putri",
    email: "hana@gamifikasi.com",
    points: 75,
    institution: "SMA Negeri 6 Denpasar",
    studentId: "NIS-2024017",
  },
  {
    name: "Ivan Kurniawan",
    email: "ivan@gamifikasi.com",
    points: 45,
    institution: "SMA Negeri 1 Makassar",
    studentId: "NIS-2024018",
  },
  {
    name: "Jasmine Lee",
    email: "jasmine@gamifikasi.com",
    points: 15,
    institution: "SMA Negeri 7 Palembang",
    studentId: "NIS-2024019",
  },
] as const;

export async function seedLeaderboardDemo(prisma: PrismaClient) {
  const passwordHash = await bcrypt.hash("student123", 10);

  for (const student of DEMO_STUDENTS) {
    await prisma.user.upsert({
      where: { email: student.email },
      update: {
        name: student.name,
        points: student.points,
        institution: student.institution,
        studentId: student.studentId,
        isActive: true,
        role: Role.STUDENT,
      },
      create: {
        name: student.name,
        email: student.email,
        password: passwordHash,
        role: Role.STUDENT,
        points: student.points,
        institution: student.institution,
        studentId: student.studentId,
        gender: Gender.FEMALE,
        isActive: true,
      },
    });
  }

  console.log(`  ✅ Leaderboard demo: ${DEMO_STUDENTS.length} students with varied points`);
}
