import { LoginForm } from "@/components/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { labels } from "@/lib/labels";
import { Sparkles, Trophy, Zap } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {labels.theme.appearance}
        </span>
        <ModeToggle showLabel />
      </div>

      <div className="hidden w-1/2 flex-col justify-between border-r border-border bg-card p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </div>
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

      <div className="flex flex-1 flex-col items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground lg:hidden">
              <Sparkles className="size-5" />
            </div>
            <CardTitle className="text-xl">{labels.login.title}</CardTitle>
            <CardDescription>{labels.login.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <p className="mt-6 rounded-md bg-muted p-3 text-center text-xs text-muted-foreground">
              {labels.login.demoAdmin}
              <br />
              {labels.login.demoStudent}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
