import Link from "next/link";
import { RegisterForm } from "@/components/register-form";
import { LandingNav } from "@/components/landing/landing-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { labels } from "@/lib/labels";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Trophy, Zap } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <LandingNav page="register" />

      <div className="flex min-h-0 flex-1 pt-14 md:pt-0">
        <div className="hidden w-1/2 flex-col justify-between border-r border-border bg-card p-12 lg:flex">
          <div className="flex items-center gap-3">
            <BrandLogo size="lg" priority />
            <span className="text-xl font-semibold">{labels.nav.brand}</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold leading-tight">
              {labels.login.heroTitle}
            </h2>
            <p className="max-w-md text-muted-foreground">{labels.register.subtitle}</p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Trophy className="size-4 text-points" />
                <span>{labels.login.heroEarnPoints}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-primary" />
                <span>{labels.login.heroAiFeedback}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {labels.nav.brand}
            <br />
            {labels.landing.footer.createdBy}
          </p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-background p-6">
          <Card className="my-6 w-full max-w-xl">
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto mb-2 lg:hidden">
                <BrandLogo size="lg" className="mx-auto" priority />
              </div>
              <CardTitle className="text-xl">{labels.register.title}</CardTitle>
              <CardDescription>{labels.register.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm />
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {labels.login.haveAccount}{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  {labels.auth.signIn}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
