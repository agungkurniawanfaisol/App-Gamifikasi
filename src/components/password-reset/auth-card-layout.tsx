import type { ReactNode } from "react";

import { LandingNav } from "@/components/landing/landing-nav";
import { AuthBrandHeader } from "@/components/auth/auth-brand-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthCardLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthCardLayout({
  title,
  subtitle,
  children,
}: AuthCardLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <LandingNav page="login" />
      <main className="flex flex-1 items-center justify-center p-4 pt-20 sm:p-6 sm:pt-20 md:p-8 md:pt-8">
        <Card className="w-full max-w-md shadow-sm">
          <CardHeader className="space-y-4 text-center">
            <AuthBrandHeader priority showTitle={false} />
            <div className="space-y-1.5">
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{subtitle}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </main>
    </div>
  );
}
