"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Gender, Role, type Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserId, requireAdmin } from "@/lib/auth-helpers";

const emptyToUndefined = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : v;

const userBaseSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Invalid email address."),
  phone: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  dateOfBirth: z.preprocess(emptyToUndefined, z.string().optional()),
  gender: z.preprocess(
    emptyToUndefined,
    z.nativeEnum(Gender).optional()
  ),
  institution: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  studentId: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  role: z.nativeEnum(Role),
  isActive: z.coerce.boolean(),
});

const createUserSchema = userBaseSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const updateUserSchema = userBaseSchema.extend({
  password: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v?.trim() ? v.trim() : undefined)),
});

export type UserListItem = {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  institution: string | null;
  studentId: string | null;
  isActive: boolean;
  points: number;
  createdAt: Date;
};

export type UserDetail = UserListItem & {
  dateOfBirth: Date | null;
  gender: Gender | null;
};

export type UserFormInput = {
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender | "";
  institution?: string;
  studentId?: string;
  role: Role;
  isActive: boolean;
  password?: string;
};

function parseDateOfBirth(value: string | undefined): Date | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date of birth.");
  }
  if (date > new Date()) {
    throw new Error("Date of birth cannot be in the future.");
  }
  return date;
}

function toUserData(
  data: z.infer<typeof userBaseSchema>,
  passwordHash?: string
): Prisma.UserUpdateInput {
  const payload: Prisma.UserUpdateInput = {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || null,
    dateOfBirth: parseDateOfBirth(data.dateOfBirth),
    gender: data.gender ? (data.gender as Gender) : null,
    institution: data.institution?.trim() || null,
    studentId: data.studentId?.trim() || null,
    role: data.role,
    isActive: data.isActive,
  };
  if (passwordHash) {
    payload.password = passwordHash;
  }
  return payload;
}

export async function getUsers(options?: {
  role?: Role;
  search?: string;
}): Promise<UserListItem[]> {
  await requireAdmin();

  const where: Prisma.UserWhereInput = {};

  if (options?.role) {
    where.role = options.role;
  }

  if (options?.search?.trim()) {
    const q = options.search.trim();
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q } },
      { institution: { contains: q } },
      { studentId: { contains: q } },
    ];
  }

  return prisma.user.findMany({
    where,
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      institution: true,
      studentId: true,
      isActive: true,
      points: true,
      createdAt: true,
    },
  });
}

export async function getUserById(id: number): Promise<UserDetail | null> {
  await requireAdmin();

  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      institution: true,
      studentId: true,
      isActive: true,
      points: true,
      createdAt: true,
    },
  });
}

export async function createUser(data: UserFormInput) {
  await requireAdmin();

  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Invalid user data.");
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email.trim().toLowerCase() },
  });
  if (existing) {
    throw new Error("Email is already registered.");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const profile = toUserData(parsed.data);
  await prisma.user.create({
    data: {
      name: profile.name as string,
      email: parsed.data.email.trim().toLowerCase(),
      password: passwordHash,
      role: parsed.data.role,
      phone: profile.phone as string | null | undefined,
      dateOfBirth: profile.dateOfBirth as Date | null | undefined,
      gender: profile.gender as Gender | null | undefined,
      institution: profile.institution as string | null | undefined,
      studentId: profile.studentId as string | null | undefined,
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUser(id: number, data: UserFormInput) {
  await requireAdmin();

  const parsed = updateUserSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Invalid user data.");
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("User not found.");
  }

  const email = parsed.data.email.trim().toLowerCase();
  if (email !== existing.email) {
    const duplicate = await prisma.user.findUnique({ where: { email } });
    if (duplicate) {
      throw new Error("Email is already registered.");
    }
  }

  let passwordHash: string | undefined;
  if (parsed.data.password) {
    passwordHash = await bcrypt.hash(parsed.data.password, 10);
  }

  await prisma.user.update({
    where: { id },
    data: toUserData(parsed.data, passwordHash),
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  redirect("/admin/users");
}

export async function deleteUser(id: number) {
  const session = await requireAdmin();
  const currentUserId = getUserId(session);

  if (id === currentUserId) {
    throw new Error("You cannot delete your own account.");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error("User not found.");
  }

  if (user.role === Role.ADMIN) {
    const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
    if (adminCount <= 1) {
      throw new Error("Cannot delete the last admin account.");
    }
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}
