"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-logo";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { Button } from "@/components/ui/button";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

type PublicNavPage = "landing" | "login" | "register";

export function LandingNav({ page = "landing" }: { page?: PublicNavPage }) {
  const isLanding = page === "landing";
  const isAuthPage = page === "login" || page === "register";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 md:sticky">
      <div className="mx-auto flex h-14 min-w-0 max-w-6xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        {isLanding ? (
          <BrandMark href="/" priority className="min-w-0 shrink-0" />
        ) : (
          <Link
            href="/"
            className="inline-flex min-h-11 min-w-0 shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{labels.login.backToHome}</span>
          </Link>
        )}

        {isLanding && (
          <>
            <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex">
              <a
                href="#leaderboard"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {labels.landing.nav.leaderboard}
              </a>
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {labels.landing.nav.features}
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {labels.landing.nav.howItWorks}
              </a>
            </nav>
            <div className="flex-1 lg:hidden" />
          </>
        )}

        {isAuthPage && <div className="min-w-0 flex-1" />}

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {isLanding && <ModeToggle />}
          <Button
            asChild
            variant={page === "login" ? "secondary" : "outline"}
            size="sm"
            className={cn(
              "min-h-11 px-3 sm:px-4",
              page === "login" && "pointer-events-none"
            )}
          >
            <Link href="/login" aria-current={page === "login" ? "page" : undefined}>
              {labels.auth.signIn}
            </Link>
          </Button>
          <Button
            asChild
            variant={page === "register" ? "default" : "outline"}
            size="sm"
            className={cn(
              "min-h-11 px-3 sm:px-4",
              page === "register" && "pointer-events-none",
              page !== "register" && "border-primary/30 bg-primary/5 hover:bg-primary/10"
            )}
          >
            <Link
              href="/register"
              aria-current={page === "register" ? "page" : undefined}
            >
              {labels.auth.signUp}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
