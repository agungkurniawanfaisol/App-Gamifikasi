export type ChatMessageMeta = {
  id: number;
  role: "USER" | "ASSISTANT";
  message: string;
  createdAt?: string;
  responseMs?: number;
};

export function attachResponseDurations<T extends ChatMessageMeta>(
  messages: T[]
): T[] {
  let lastUserCreatedAt: string | undefined;

  return messages.map((message) => {
    if (message.role === "USER") {
      lastUserCreatedAt = message.createdAt;
      return message;
    }

    if (
      message.role === "ASSISTANT" &&
      message.createdAt &&
      lastUserCreatedAt
    ) {
      const userTime = new Date(lastUserCreatedAt).getTime();
      const assistantTime = new Date(message.createdAt).getTime();
      if (
        !Number.isNaN(userTime) &&
        !Number.isNaN(assistantTime) &&
        assistantTime >= userTime
      ) {
        return {
          ...message,
          responseMs: assistantTime - userTime,
        };
      }
    }

    return message;
  });
}

export function formatResponseDuration(ms: number): string {
  if (ms < 1000) return `${Math.max(1, Math.round(ms))}ms`;

  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds > 0 ? `${minutes}m ${String(seconds).padStart(2, "0")}s` : `${minutes}m`;
}

export function mapChatHistoryRow(row: {
  id: number;
  role: "USER" | "ASSISTANT";
  message: string;
  createdAt: Date;
}): ChatMessageMeta {
  return {
    id: row.id,
    role: row.role,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapChatHistoryRows(
  rows: {
    id: number;
    role: "USER" | "ASSISTANT";
    message: string;
    createdAt: Date;
  }[]
): ChatMessageMeta[] {
  return attachResponseDurations(rows.map(mapChatHistoryRow));
}
