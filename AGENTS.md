# Agent Configuration

## Cursor Rules (always active)

| Rule | Path |
|------|------|
| MySQL indexing required | `.cursor/rules/mysql-indexing-required.mdc` |
| MySQL query performance | `.cursor/rules/mysql-query-performance.mdc` |
| UI/UX clarity | `.cursor/rules/ui-ux-clarity.mdc` |
| English only (UI + AI) | `.cursor/rules/english-only.mdc` |

## Project Skills

| Skill | Path | When to use |
|-------|------|-------------|
| Next-Gamifikasi MySQL | `.cursor/skills/next-gamifikasi-mysql/SKILL.md` | Schema migrations, Prisma queries, slow DB issues |
| Next-Gamifikasi UI/UX | `.cursor/skills/next-gamifikasi-ui-ux/SKILL.md` | Pages, components, navigation, forms, clarity |

## Global Skills (from [skills.sh](https://skills.sh/))

Installed via `npx skills add ... -g --agent cursor`:

**Database**

- `prisma-client-api` — Prisma CRUD, select/include, transactions
- `mysql-best-practices` — InnoDB, EXPLAIN, indexing
- `prisma-expert` — Schema design, N+1 fixes, migrations

**Next.js / React**

- `next-best-practices` — Next.js App Router patterns
- `vercel-react-best-practices` — React/Next performance
- `vercel-composition-patterns` — Component composition patterns

**UI / UX / Accessibility**

- `web-design-guidelines` — Vercel Web Interface Guidelines audit (362K+ installs)
- `accessibility` — WCAG 2.1 POUR, contrast, keyboard, forms ([davila7/claude-code-templates](https://skills.sh/davila7/claude-code-templates/accessibility))
- `ux-audit` — UX audit workflow for confusing flows ([jezweb/claude-skills](https://skills.sh/jezweb/claude-skills/ux-audit))
- `frontend-design` — Distinctive UI, anti–AI-slop aesthetics
- `ui-ux-pro-max` — Design system, UX patterns, shadcn stacks

Location: `~/.agents/skills/`

## Database performance checklist

1. Every FK and frequent `WHERE`/`ORDER BY` column has `@@index` in `prisma/schema.prisma`
2. No queries inside loops — batch with `findMany` + `in`
3. Use `select` to exclude large text fields in list queries
4. Run `npx prisma migrate dev` after schema index changes

## UI/UX clarity checklist

1. One page title + one primary CTA per section
2. Navigation always visible; active route highlighted
3. All copy in `src/lib/labels.ts` — English only (UI and Ollama AI)
4. Empty and loading states explain what to do next
5. Audit with `web-design-guidelines` before shipping major UI changes
