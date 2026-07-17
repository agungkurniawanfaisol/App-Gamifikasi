import { LoginForm } from "@/components/login-form";
import { LandingNav } from "@/components/landing/landing-nav";
import { AuthBrandHeader } from "@/components/auth/auth-brand-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { labels } from "@/lib/labels";
import { Trophy, Zap } from "lucide-react";

type LoginPageProps = {
  searchParams: { passwordReset?: string | string[] };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const passwordWasReset = searchParams.passwordReset === "success";

  return (
    <div className="flex min-h-dvh flex-col">
      <LandingNav page="login" />

      <div className="flex min-h-0 flex-1 pt-14 md:pt-0">
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-border bg-card p-10 lg:flex xl:p-12">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.08),transparent_55%)]"
            aria-hidden="true"
          />

          <AuthBrandHeader align="start" priority className="relative" />

          <div className="relative space-y-5">
            <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
              {labels.login.heroTitle}
            </h2>
            <p className="max-w-md text-muted-foreground">
              {labels.meta.description}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Trophy className="size-4 text-points" aria-hidden />
                <span>{labels.login.heroEarnPoints}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-primary" aria-hidden />
                <span>{labels.login.heroAiFeedback}</span>
              </div>
            </div>
          </div>

          <p className="relative text-xs text-muted-foreground">
            © {new Date().getFullYear()} {labels.nav.brand}
          </p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-background p-4 sm:p-6">
          <Card className="w-full max-w-md shadow-sm">
            <CardHeader className="space-y-4 text-center">
              <div className="lg:hidden">
                <AuthBrandHeader priority showTitle={false} />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-xl">{labels.login.title}</CardTitle>
                <CardDescription>{labels.login.subtitle}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordWasReset && (
                <Alert>
                  <AlertDescription>
                    {labels.passwordReset.success}
                  </AlertDescription>
                </Alert>
              )}
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
