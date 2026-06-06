import { Gender } from "@prisma/client";
import { z } from "zod";

export const emptyToUndefined = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : v;

export function parseDateOfBirth(value: string | undefined): Date | null {
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

export const selfProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  phone: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  dateOfBirth: z.preprocess(emptyToUndefined, z.string().optional()),
  gender: z.preprocess(
    emptyToUndefined,
    z.nativeEnum(Gender).optional()
  ),
  institution: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  studentId: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  profileImageUrl: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  password: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v?.trim() ? v.trim() : undefined)),
});

export type SelfProfileInput = z.infer<typeof selfProfileSchema>;

export type ProfileSummary = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  dateOfBirth: Date | null;
  gender: Gender | null;
  institution: string | null;
  studentId: string | null;
  points: number;
  profileImageUrl: string | null;
};

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
}
