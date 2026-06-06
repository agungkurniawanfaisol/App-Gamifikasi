# Component Checklist

## Every new page

- [ ] Uses `AppShell` (admin/student) or dedicated auth layout
- [ ] Breadcrumbs visible in `AppTopHeader`; dynamic segments via `SetBreadcrumbs` in nested layouts when needed
- [ ] Has `PageHeader` with title; description only if non-redundant
- [ ] Primary action is obvious (one filled button per card/section)
- [ ] All strings from `labels.ts` (English only — no Indonesian or mixed language)
- [ ] Works in light and dark mode (test `ModeToggle`)
- [ ] Responsive: sidebar + content stack on small screens if applicable
- [ ] Uses Radix tokens only — no `glass-card`, `brand-gradient`, `app-mesh`, or custom gold colors
- [ ] Cards: `surface-card`, `surface-card-interactive`, or `surface-card-featured` from `globals.css`
- [ ] Points/gamification: `text-points` or `Badge variant="points"` (Radix Amber)

## Navigation

- [ ] `NavLink` shows active state for current route
- [ ] Page-level navigation via breadcrumbs; back buttons only in flow completion states
- [ ] User context visible (name, points for student; admin panel label)

## Forms

- [ ] Every input has `<Label htmlFor="...">`
- [ ] Submit shows pending state (`Signing in...`, disabled button)
- [ ] Errors use `Alert` with clear message + recovery hint
- [ ] Destructive actions use `variant="destructive"` and confirm when irreversible

## Learning flow

- [ ] Progress always visible before action (bar or percent)
- [ ] Locked groups show why (`Complete the previous group first`)
- [ ] Status badges match `getStatusLabel()` values
- [ ] Quiz feedback distinguishes correct/incorrect with color + text
- [ ] Learn view material nav uses fixed-height `ScrollArea` (sidebar does not scroll with page)
- [ ] App shell sidebar is `fixed`; only main content scrolls (`h-dvh overflow-y-auto`)

## Accessibility

- [ ] Focus ring visible on buttons and links (`focus-visible:ring`)
- [ ] Icon buttons have `aria-label` (e.g. theme toggle)
- [ ] Heading hierarchy: one `h1` per page, then `h2`/`h3` in order
- [ ] Color is not the only indicator (pair with text/icons)

## Empty & loading

- [ ] Empty lists explain next step ("Add New Group", "No published groups yet")
- [ ] Chat shows typing indicator for streaming assistant
- [ ] No blank white screens during server/client transitions
