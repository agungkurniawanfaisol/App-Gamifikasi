# Reward & Achievement System — Design Spec

## Summary

Unified reward layer on top of existing points, badges, and challenges. Students earn **bonus points**, **digital certificates**, and **premium content unlocks** through configurable achievements.

## Trigger → Reward Model

| Trigger | When evaluated | Default reward |
|---------|----------------|----------------|
| `GROUP_COMPLETE` | After `markGroupCompleted` | Bonus points at 1 / 5 / 10 groups |
| `LEVEL_COMPLETE` | All published groups in level done | Digital certificate |
| `PROFICIENCY_REACH` | Proficiency level-up | Premium unlock for matching course level |

## Database

- `AchievementDefinition` + `AchievementReward` — catalog
- `UserAchievement` — earned log (idempotent)
- `CertificateTemplate` + `UserCertificate` — issued certificates
- `UserPremiumUnlock` — per-level premium access
- `LearningGroup.isPremium` — admin flag

## Access Control

`canAccessGroup` = sequential unlock AND (not premium OR has premium unlock for level).

## UI

- `/dashboard/rewards` — Achievements, Certificates, Premium Unlocks tabs
- `RewardCelebrationModal` — single hero moment (certificate or premium unlock + bonus chips)
- Learn level page — Premium badge + lock CTA
- Admin group edit — Premium content checkbox

## Files

- `src/lib/achievement-engine.ts`
- `src/lib/premium-access.ts`
- `src/lib/certificate-service.ts`
- `src/components/student/rewards/*`
- `src/app/dashboard/rewards/*`
