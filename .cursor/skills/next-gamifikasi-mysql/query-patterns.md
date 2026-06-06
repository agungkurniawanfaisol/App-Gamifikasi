# Query Patterns

## List groups (no large fields)

```typescript
prisma.learningGroup.findMany({
  where: { levelId, isPublished: true },
  orderBy: { order: "asc" },
  select: {
    id: true,
    title: true,
    order: true,
    _count: { select: { materials: true, questions: true } },
  },
})
```

## Material list (exclude content)

```typescript
prisma.material.findMany({
  where: { groupId },
  orderBy: { order: "asc" },
  select: { id: true, title: true, order: true },
})
```

## Batch progress lookup

```typescript
const groupIds = groups.map((g) => g.id)
const progressList = await prisma.userProgress.findMany({
  where: { userId, groupId: { in: groupIds } },
  select: {
    groupId: true,
    isGroupCompleted: true,
    lastMaterialId: true,
  },
})
const progressMap = new Map(progressList.map((p) => [p.groupId, p]))
```

## Batch access check (replace N× canAccessGroup)

```typescript
function buildAccessMap(
  groups: { id: number; order: number }[],
  progressMap: Map<number, { isGroupCompleted: boolean }>
): Map<number, boolean> {
  const access = new Map<number, boolean>()
  for (let i = 0; i < groups.length; i++) {
    if (i === 0) {
      access.set(groups[i].id, true)
      continue
    }
    const prev = groups[i - 1]
    access.set(
      groups[i].id,
      progressMap.get(prev.id)?.isGroupCompleted === true
    )
  }
  return access
}
```

## Chat history (paginated)

```typescript
prisma.chatHistory.findMany({
  where: { userId },
  orderBy: { createdAt: "desc" },
  take: 20,
  select: { id: true, role: true, message: true, createdAt: true },
})
```

## Admin student count

```typescript
prisma.user.count({ where: { role: "STUDENT" } })
// Requires @@index([role]) for scale; acceptable at low volume without it
```
