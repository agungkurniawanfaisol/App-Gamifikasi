"use client";

export function LandingTechBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden [contain:paint]"
      aria-hidden="true"
    >
      <div className="landing-grid-bg absolute inset-0 opacity-35 dark:opacity-20" />

      <div className="landing-float landing-float-delay-1 landing-gpu absolute -left-8 top-[12%] size-52 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="landing-float-reverse landing-float-delay-2 landing-gpu absolute -right-12 top-[22%] size-64 rounded-full bg-primary/12 blur-3xl" />
      <div className="landing-float-soft landing-gpu absolute bottom-[18%] left-[32%] size-44 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="landing-scan-beam absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="landing-scan-line absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/10 to-transparent opacity-40" />
    </div>
  );
}

export function LandingDataStream() {
  return (
    <div
      className="relative h-1.5 overflow-hidden border-y border-primary/10 bg-muted/20"
      aria-hidden="true"
    >
      <div className="landing-data-stream-bar absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="landing-data-stream-bar landing-data-stream-bar-delay absolute inset-y-0 w-1/5 bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
    </div>
  );
}
