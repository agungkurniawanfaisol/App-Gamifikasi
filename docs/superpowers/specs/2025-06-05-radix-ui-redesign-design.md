# Radix Colors UI/UX Redesign

**Date:** 2025-06-05  
**Project:** Next-Gamifikasi  
**Status:** Approved for implementation

## Goals

1. Sidebar must never scroll with page content (fixed viewport shell).
2. Migrate entire UI to [Radix Colors](https://www.radix-ui.com/colors): **Violet** (accent) + **Slate** (neutrals) + **Amber** (points).
3. Remove custom mesh/gradient/glass aesthetics; adopt refined Radix/shadcn look.
4. Keep all UI labels and AI/Ollama responses in English via `labels.ts` and `lib/ollama.ts`.

## Layout

- `fixed inset-y-0 left-0 w-64` sidebar; `ml-64 h-dvh overflow-y-auto` main only.
- Sidebar zones: header (fixed) | nav (overflow-hidden) | footer (fixed).
- Learn material list: `ScrollArea` with max height inside content column.

## Color tokens

| Semantic | Light/Dark source |
|----------|-------------------|
| background, card | slate-1 / slate-2 |
| foreground | slate-12 |
| muted | slate-3 / slate-11 |
| border, input | slate-6 / slate-7 |
| primary | violet-9 |
| accent (hover) | violet-3 / violet-4 |
| ring | violet-8 |
| destructive | red-9 |
| points badge | amber-9 / amber-11 |

## Typography

- Single font: Plus Jakarta Sans (remove Syne display).

## Out of scope

- Ollama prompts, DB content, new Radix Primitives beyond Colors.
