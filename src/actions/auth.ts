"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { labels } from "@/lib/labels";

export async function loginAction(
  _prev: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  try {
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      return labels.auth.invalidCredentials;
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return labels.auth.invalidCredentials;
    }
    throw error;
  }

  const email = formData.get("email") as string;
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.role === Role.ADMIN) redirect("/admin/dashboard");
  redirect("/dashboard");
}

export async function logoutAction() {
  const { signOut } = await import("@/auth");
  await signOut({ redirectTo: "/login" });
}
