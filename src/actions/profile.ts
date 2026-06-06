"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Gender, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUserId, requireAuth } from "@/lib/auth-helpers";
import {
  parseDateOfBirth,
  selfProfileSchema,
  type ProfileSummary,
  type SelfProfileInput,
} from "@/lib/user-profile";

const profileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  dateOfBirth: true,
  gender: true,
  institution: true,
  studentId: true,
  points: true,
  profileImageUrl: true,
} satisfies Prisma.UserSelect;

export async function getMyProfile(): Promise<ProfileSummary> {
  const session = await requireAuth();
  const userId = getUserId(session);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
}

export async function updateMyProfile(input: SelfProfileInput): Promise<void> {
  const session = await requireAuth();
  const userId = getUserId(session);

  const parsed = selfProfileSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Invalid profile data.";
    throw new Error(message);
  }

  const data = parsed.data;
  const updateData: Prisma.UserUpdateInput = {
    name: data.name.trim(),
    phone: data.phone?.trim() || null,
    dateOfBirth: parseDateOfBirth(data.dateOfBirth),
    gender: data.gender ? (data.gender as Gender) : null,
    institution: data.institution?.trim() || null,
    studentId: data.studentId?.trim() || null,
    profileImageUrl: data.profileImageUrl?.trim() || null,
  };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath("/admin");
  revalidatePath("/admin/profile");
}

export async function getHeaderProfile(): Promise<{
  name: string;
  email: string;
  profileImageUrl: string | null;
  profileHref: string;
}> {
  const session = await requireAuth();
  const userId = getUserId(session);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      profileImageUrl: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return {
    name: user.name,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
    profileHref:
      user.role === "ADMIN" ? "/admin/profile" : "/dashboard/profile",
  };
}
