# Learning Progress Section — Design Spec

## Summary

Full-width dashboard section combining **material step completion**, **proficiency level progress**, and **hybrid per-skill progress** (completion bar + accuracy caption).

Placement: below hero stats on `/dashboard`. Existing Progress and Proficiency hero cards remain unchanged.

## Metrics

| Track | Formula | Source |
|-------|---------|--------|
| Material Completion | `completedSteps / totalSteps` across published groups | `getBatchGroupStepProgress` summed |
| Level Progress | % within current proficiency band | `getProficiencySummary` |
| Skill (bar) | `attemptedSubQuestions / totalPublishedSubQuestions` per skill | `user_answers` + published content |
| Skill (caption) | `X/Y done · Z% accuracy` | distinct answers + `isCorrect` |

Skill resolution: `sub_questions[index].skill` → fallback `contentItem.skill`.

## UI

- Row 1: Material + Level (2 columns desktop)
- Row 2: Speaking, Reading, Writing, Listening (2×2 grid)
- Skill colors: violet, emerald, sky, amber (aligned with admin question preview)

## Files

- `src/lib/skill-progress.ts`
- `src/lib/skill-progress-queries.ts`
- `src/components/student/progress/learning-progress-section.tsx`
- `src/components/student/progress/skill-progress-row.tsx`
- `src/app/dashboard/page.tsx`
- `src/lib/labels.ts` → `labels.progress.*`

## Out of scope (initial iteration)

- New database tables
- Replacing hero stat cards

## Follow-up (implemented)

- **Profile page** (`/dashboard/profile`) — full `LearningProgressSection`
- **Learning sidebar** — compact skill progress grid via `LearningProgressSkillsCompact`
