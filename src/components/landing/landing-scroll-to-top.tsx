"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function LandingScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      aria-label={labels.landing.scrollToTop}
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-5 right-4 z-50 size-11 rounded-full border-primary/25 bg-background/95 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-background sm:bottom-6 sm:right-6",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      )}
    >
      <ArrowUp className="size-5 text-primary" />
    </Button>
  );
}
