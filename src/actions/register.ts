"use server";

import bcrypt from "bcryptjs";
import { Gender, Role } from "@prisma/client";
import { z } from "zod";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { labels } from "@/lib/labels";
import { redirect } from "next/navigation";

const emptyToUndefined = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : v;

const registerSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    name: z.string().trim().min(2),
    phone: z.preprocess(emptyToUndefined, z.string().trim().optional()),
    dateOfBirth: z.preprocess(emptyToUndefined, z.string().optional()),
    gender: z.preprocess(emptyToUndefined, z.nativeEnum(Gender).optional()),
    institution: z.preprocess(emptyToUndefined, z.string().trim().optional()),
    studentId: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });

function parseDateOfBirth(value: string | undefined): Date | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date > new Date()) return null;
  return date;
}

export async function registerAction(
  _prev: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    dateOfBirth: formData.get("dateOfBirth"),
    gender: formData.get("gender"),
    institution: formData.get("institution"),
    studentId: formData.get("studentId"),
  });

  if (!parsed.success) {
    const issue = parsed.error.errors[0];
    if (issue?.message === "passwordMismatch") {
      return labels.register.passwordMismatch;
    }
    return labels.register.invalidInput;
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return labels.register.emailTaken;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      password: passwordHash,
      role: Role.STUDENT,
      phone: parsed.data.phone?.trim() || null,
      dateOfBirth: parseDateOfBirth(parsed.data.dateOfBirth),
      gender: parsed.data.gender ?? null,
      institution: parsed.data.institution?.trim() || null,
      studentId: parsed.data.studentId?.trim() || null,
      isActive: true,
    },
  });

  await signIn("credentials", {
    email,
    password: parsed.data.password,
    redirect: false,
  });

  redirect("/dashboard");
}
