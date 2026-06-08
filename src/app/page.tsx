import type { Metadata } from "next";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/landing-page";
import { labels } from "@/lib/labels";

export const metadata: Metadata = {
  title: labels.landing.meta.title,
  description: labels.landing.meta.description,
};

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    if (session.user.role === Role.ADMIN) redirect("/admin/dashboard");
    redirect("/dashboard");
  }

  return <LandingPage />;
}
