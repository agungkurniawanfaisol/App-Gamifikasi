import { cache } from "react";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

const getSession = cache(async () => auth());

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== Role.ADMIN) redirect("/dashboard");
  return session;
}

export async function requireStudent() {
  const session = await requireAuth();
  if (session.user.role !== Role.STUDENT) redirect("/admin/dashboard");
  return session;
}

export function getUserId(session: { user: { id: string } }): number {
  return parseInt(session.user.id, 10);
}
