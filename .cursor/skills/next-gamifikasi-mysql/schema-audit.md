# Schema Index Audit

## Recommended Prisma indexes

```prisma
model User {
  // ...
  @@index([role])
  @@map("users")
}

model LearningGroup {
  // ...
  @@index([levelId, isPublished, order])
  @@map("learning_groups")
}

model Material {
  // ...
  @@index([groupId, order])
  @@map("materials")
}

model Question {
  // ...
  @@index([groupId, order])
  @@map("questions")
}

model UserProgress {
  // ...
  @@unique([userId, groupId])
  @@index([userId, isGroupCompleted])
  @@map("user_progress")
}

model UserAnswer {
  // ...
  @@index([userId, questionId])
  @@map("user_answers")
}

model ChatHistory {
  // ...
  @@index([userId, createdAt])
  @@map("chat_history")
}
```

## Equivalent SQL (reference)

```sql
CREATE INDEX idx_learning_groups_level_published_order
  ON learning_groups (level_id, is_published, order_index);

CREATE INDEX idx_materials_group_order
  ON materials (group_id, order_index);

CREATE INDEX idx_questions_group_order
  ON questions (group_id, order_index);

CREATE INDEX idx_user_progress_user_completed
  ON user_progress (user_id, is_group_completed);

CREATE INDEX idx_user_answers_user_question
  ON user_answers (user_id, question_id);

CREATE INDEX idx_chat_history_user_created
  ON chat_history (user_id, created_at);

CREATE INDEX idx_users_role ON users (role);
```

## Verify index usage

```sql
EXPLAIN SELECT * FROM learning_groups
WHERE level_id = 1 AND is_published = 1
ORDER BY order_index ASC;
```

Look for `type: ref` or `range` (good), not `ALL` (full table scan).
