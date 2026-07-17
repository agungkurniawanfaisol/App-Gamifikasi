"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { Button } from "@/components/ui/button";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

type PublicNavPage = "landing" | "login" | "register";

export function LandingNav({ page = "landing" }: { page?: PublicNavPage }) {
  const isLanding = page === "landing";
  const isAuthPage = page === "login" || page === "register";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/90 shadow-[0_1px_0_color-mix(in_srgb,var(--primary)_6%,transparent)] backdrop-blur-md supports-[backdrop-filter]:bg-background/75 md:sticky">
      <div className="mx-auto flex h-14 min-w-0 max-w-6xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        {isLanding ? (
          <Link href="/" className="shrink-0">
            <BrandLogo size="md" priority />
          </Link>
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
            <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
              <a
                href="#leaderboard"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
              >
                {labels.landing.nav.leaderboard}
              </a>
              <a
                href="#features"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
              >
                {labels.landing.nav.features}
              </a>
              <a
                href="#how-it-works"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
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
            variant={page === "register" ? "default" : isLanding ? "default" : "outline"}
            size="sm"
            className={cn(
              "min-h-11 px-3 sm:px-4",
              page === "register" && "pointer-events-none",
              isLanding &&
                "landing-cta-glow border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
              !isLanding &&
                page !== "register" &&
                "border-primary/30 bg-primary/5 hover:bg-primary/10"
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
