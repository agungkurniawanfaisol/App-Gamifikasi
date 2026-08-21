import { cache } from "react";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { isAppUserId, parseAppUserId } from "@/lib/auth-identity";

const getSession = cache(async () => auth());

function hasValidAppSession(session: {
  user?: { id?: string; role?: Role };
}): boolean {
  const role = session.user?.role;
  return (
    isAppUserId(session.user?.id) &&
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
  const id = parseAppUserId(session.user.id);
  if (id == null) {
    redirect("/login");
  }
  return id;
}
