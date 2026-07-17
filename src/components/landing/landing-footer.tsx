import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-logo";
import { labels } from "@/lib/labels";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/40 py-10 dark:bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <BrandMark subtitle={labels.landing.footer.tagline} />

          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/login"
              className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
            >
              {labels.landing.footer.signIn}
            </Link>
            <span className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} {labels.nav.brand}
            </span>
          </div>
        </div>

        <p className="mt-8 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          {labels.landing.footer.createdBy}
        </p>
      </div>
    </footer>
  );
}
