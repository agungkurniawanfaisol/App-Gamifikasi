# Layout Patterns

## Student dashboard

```
PageHeader (welcome + choose level)
└── Grid of level cards
    ├── Level name + progress %
    ├── Progress bar
    └── Single CTA: Start / Continue Learning
```

## Learn level (group list)

```
PageHeader (level name)
└── Stack of group cards
    ├── Title + status badge
    ├── Material progress bar
    └── Start/Continue OR lock message with icon
```

## App shell (all authenticated pages)

```
AppShell
├── Sidebar (desktop fixed / mobile Sheet)
├── AppTopHeader (sticky)
│   ├── BreadcrumbNav (route + SetBreadcrumbs overrides)
│   └── Optional header actions slot
└── Scrollable content (bg-muted/30)
    ├── PageHeader (title + description + actions)
    └── Page body (surface-card / surface-card-interactive)
```

## Learn material

```
Breadcrumbs: Home → Level → Group
PageHeader (group title)
GroupStepFlow
├── Steps nav (Sheet on mobile)
└── Content panel + Previous / Next / Finish
```

## Admin group edit

```
Breadcrumbs: Dashboard → Levels → Level → Group → Content
GroupEditHeader (inline title edit, no back button)
ContentItemList
└── Forms with clear Save / Delete / Add labels
```

## Quiz flow

```
Question X of Y
Question card
├── Option buttons (A–D)
├── Correct/Incorrect feedback panel
└── Next Question / View Results
```

## Chat

```
PageHeader (title + subtitle once)
ChatInterface
├── Empty state with icon when no messages
├── User bubbles (right), assistant (left)
└── Input + Send (never icon-only send without label on mobile)
```
