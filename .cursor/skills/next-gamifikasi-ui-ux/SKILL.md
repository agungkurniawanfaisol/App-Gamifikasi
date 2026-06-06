---
name: next-gamifikasi-ui-ux
description: Designs clear, non-confusing UI/UX for the Next-Gamifikasi learning platform. Use when building or refactoring pages, components, layouts, navigation, forms, empty states, or when the user asks for better UI, UX, or less confusing interfaces.
---

# Next-Gamifikasi UI/UX

Gamification learning app: students progress through levels → groups → materials → quiz. Admins manage content.

## Design principles

1. **Clarity over decoration** — user always knows location and next step
2. **Consistent patterns** — reuse `AppShell`, `AppTopHeader`, `PageHeader`, `StatCard`, `NavLink`, `surface-card*` utilities with Radix tokens
3. **Progressive disclosure** — show level summary first, details on drill-down
4. **Accessible by default** — labels on inputs, focus visible, contrast in light and dark mode

## Layout patterns

| Role | Shell | Nav |
|------|-------|-----|
| Admin | `AppShell` + `AdminSidebar` | Dashboard, Levels |
| Student | `AppShell` + `StudentNav` | Home, AI Chat + points card |
| Auth | Full-page login split layout | Theme toggle top-right |

See [layout-patterns.md](layout-patterns.md) for page structure templates.

## Component checklist

Before shipping UI changes, verify [component-checklist.md](component-checklist.md).

## Stack conventions

- **UI kit:** shadcn/ui + Tailwind + [Radix Colors](https://www.radix-ui.com/colors)
- **Palette:** Violet (primary/accent), Slate (neutrals), Amber (`points` token for gamification)
- **Tokens:** `src/app/globals.css` maps Radix scales to shadcn CSS variables; no custom mesh/glass/gradient utilities
- **Fonts:** Plus Jakarta Sans only (single typeface)
- **Copy:** `src/lib/labels.ts` only — **English only** (UI and Ollama AI; see `english-only.mdc`)
- **Icons:** lucide-react; pair with text labels on nav and primary actions

## Anti-patterns (this project)

| Bad | Good |
|-----|------|
| Scattered back buttons on every page | Sticky breadcrumbs in `AppTopHeader` |
| Multiple primary buttons per card | One primary + outline secondary |
| Fetching content without loading state | Disable button / show pending text |
| Inline hardcoded strings | `labels.student.*` / `labels.admin.*` |
| Top nav that scrolls away | Fixed `AppShell` sidebar |
| Placeholder as only form label | Visible `<Label>` + optional placeholder |

## Global skills to load

- `web-design-guidelines` — audit against Vercel Web Interface Guidelines
- `accessibility` — WCAG 2.1 AA (forms, focus, contrast)
- `ux-audit` — find confusing flows before shipping
- `frontend-design` — distinctive visuals without generic AI slop
- `vercel-composition-patterns` — scalable React component structure
