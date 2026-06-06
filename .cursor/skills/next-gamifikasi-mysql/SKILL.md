---
name: next-gamifikasi-mysql
description: Audits and optimizes MySQL/Prisma schema and queries for the Next-Gamifikasi learning platform. Use when creating migrations, modifying prisma/schema.prisma, writing Prisma queries in src/actions or src/lib, or when the user reports slow database performance.
---

# Next-Gamifikasi MySQL Performance

Stack: Prisma + MySQL (InnoDB). Schema: `prisma/schema.prisma`.

## Index checklist (required per model)

| Model | Index | Used by |
|-------|-------|---------|
| `LearningGroup` | `@@index([levelId, isPublished, order])` | `getPublishedGroupsForLevel`, admin stats |
| `Material` | `@@index([groupId, order])` | `getGroupMaterialProgress`, learn flow |
| `Question` | `@@index([groupId, order])` | quiz pages |
| `UserProgress` | `@@unique([userId, groupId])` + `@@index([userId, isGroupCompleted])` | dashboard summary, access checks |
| `ChatHistory` | `@@index([userId, createdAt])` | chat page |
| `UserAnswer` | `@@index([userId, questionId])` | quiz submit |
| `User` | `@@index([role])` | admin student count |

## Query refactor priorities

1. `src/lib/progression.ts` — batch `canAccessGroup` checks; never re-fetch all groups per group
2. `src/app/dashboard/learn/[levelId]/page.tsx` — avoid N× `canAccessGroup` in `Promise.all`
3. `src/actions/admin/stats.ts` — use `_count` with `where` instead of fetching all related rows

## Workflow

1. Read current queries in affected `src/` files
2. Add or verify `@@index` in `prisma/schema.prisma`
3. Run `npx prisma migrate dev --name <descriptive_name>`
4. Refactor queries to eliminate N+1
5. Run `npm run build` to verify

## Additional resources

- Index examples and migration snippets: [schema-audit.md](schema-audit.md)
- Safe `select`/`include` templates: [query-patterns.md](query-patterns.md)
