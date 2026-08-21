import { cache } from "react";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

const getSession = cache(async () => auth());

function hasValidAppSession(session: {
  user?: { id?: string; role?: Role };
}): boolean {
  const id = session.user?.id;
  const role = session.user?.role;
  return (
    typeof id === "string" &&
    /^\d+$/.test(id) &&
    (role === Role.ADMIN || role === Role.STUDENT)
  );
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user || !hasValidAppSession(session)) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== Role.ADMIN) {
    if (session.user.role === Role.STUDENT) redirect("/dashboard");
    redirect("/login");
  }
  return session;
}

export async function requireStudent() {
  const session = await requireAuth();
  if (session.user.role !== Role.STUDENT) {
    if (session.user.role === Role.ADMIN) redirect("/admin/dashboard");
    redirect("/login");
  }
  return session;
}

export function getUserId(session: { user: { id: string } }): number {
  const id = Number.parseInt(session.user.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    redirect("/login");
  }
  return id;
}
