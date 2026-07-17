"use client";

export function LandingTechBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden [contain:paint]"
      aria-hidden="true"
    >
      <div className="landing-grid-bg absolute inset-0 opacity-45 dark:opacity-25" />

      <div className="landing-aurora landing-gpu absolute inset-0 opacity-70 dark:opacity-90" />

      <div className="landing-float landing-float-delay-1 landing-gpu absolute -left-8 top-[12%] size-56 rounded-full bg-violet-500/20 blur-3xl dark:bg-violet-500/25" />
      <div className="landing-float-reverse landing-float-delay-2 landing-gpu absolute -right-12 top-[22%] size-72 rounded-full bg-primary/15 blur-3xl dark:bg-primary/20" />
      <div className="landing-float-soft landing-gpu absolute bottom-[18%] left-[32%] size-48 rounded-full bg-amber-500/15 blur-3xl dark:bg-amber-500/12" />
      <div className="landing-float landing-gpu absolute right-[20%] bottom-[10%] size-40 rounded-full bg-fuchsia-500/10 blur-3xl dark:bg-fuchsia-400/15" />

      <div className="landing-scan-beam absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent" />
      <div className="landing-scan-line absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-primary/12 to-transparent opacity-50 dark:opacity-40" />
    </div>
  );
}

export function LandingDataStream() {
  return (
    <div
      className="relative h-1.5 overflow-hidden border-y border-primary/15 bg-muted/30 dark:bg-muted/20"
      aria-hidden="true"
    >
      <div className="landing-data-stream-bar absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-primary/55 to-transparent" />
      <div className="landing-data-stream-bar landing-data-stream-bar-delay absolute inset-y-0 w-1/5 bg-gradient-to-r from-transparent via-violet-400/45 to-transparent" />
    </div>
  );
}
