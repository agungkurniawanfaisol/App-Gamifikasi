import { LoginForm } from "@/components/login-form";
import { LandingNav } from "@/components/landing/landing-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrandLogoPair } from "@/components/layout/brand-logo";
import { labels } from "@/lib/labels";
import { Trophy, Zap } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <LandingNav page="login" />

      <div className="flex min-h-0 flex-1 pt-14 md:pt-0">
        <div className="hidden w-1/2 flex-col justify-between border-r border-border bg-card p-12 lg:flex">
          <div className="flex flex-col gap-4">
            <BrandLogoPair
              brandSize="xl"
              partnerSize="xs"
              priority
              className="justify-start [&>img:last-of-type]:!h-10 [&>img:last-of-type]:!w-auto sm:[&>img:last-of-type]:!h-11"
            />
            <span className="text-xl font-semibold">{labels.nav.brand}</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold leading-tight">
              {labels.login.heroTitle}
            </h2>
            <p className="max-w-md text-muted-foreground">
              {labels.meta.description}
            </p>
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
          </p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-background p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto mb-3 lg:hidden">
                <BrandLogoPair
                  brandSize="lg"
                  partnerSize="xs"
                  className="mx-auto [&>img:last-of-type]:!h-9 [&>img:last-of-type]:!w-auto sm:[&>img:last-of-type]:!h-10"
                  priority
                />
              </div>
              <CardTitle className="text-xl">{labels.login.title}</CardTitle>
              <CardDescription>{labels.login.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
