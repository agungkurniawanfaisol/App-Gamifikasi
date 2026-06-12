"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import {
  getChatMonitorEntries,
  type ChatMonitorEntry,
} from "@/actions/admin/chat-monitor";
import type { ChatMonitorDatePreset } from "@/lib/chat-day";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import {
  ResponsiveTable,
  ResponsiveTableCard,
} from "@/components/ui/responsive-table";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";

function formatDateTime(value: Date) {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });
}

export function ChatMonitorPanel({
  initialEntries,
  students,
}: {
  initialEntries: ChatMonitorEntry[];
  students: { id: number; name: string }[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [datePreset, setDatePreset] = useState<ChatMonitorDatePreset>("all");
  const [isPending, startTransition] = useTransition();
  const skipInitialFetch = useRef(true);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }

    startTransition(async () => {
      const studentId =
        studentFilter === "all" ? undefined : parseInt(studentFilter, 10);
      const result = await getChatMonitorEntries({
        take: 200,
        studentId: Number.isNaN(studentId) ? undefined : studentId,
        datePreset,
      });
      setEntries(result.entries);
    });
  }, [studentFilter, datePreset]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="chat-student-filter">
            {labels.admin.chatMonitorFilterStudent}
          </Label>
          <select
            id="chat-student-filter"
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="native-select h-11"
            disabled={isPending}
          >
            <option value="all">{labels.admin.chatMonitorAllStudents}</option>
            {students.map((student) => (
              <option key={student.id} value={String(student.id)}>
                {student.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="chat-date-filter">
            {labels.admin.chatMonitorFilterDate}
          </Label>
          <select
            id="chat-date-filter"
            value={datePreset}
            onChange={(e) =>
              setDatePreset(e.target.value as ChatMonitorDatePreset)
            }
            className="native-select h-11"
            disabled={isPending}
          >
            <option value="all">{labels.admin.chatMonitorDateAll}</option>
            <option value="today">{labels.admin.chatMonitorDateToday}</option>
            <option value="yesterday">
              {labels.admin.chatMonitorDateYesterday}
            </option>
            <option value="last7days">
              {labels.admin.chatMonitorDateLast7Days}
            </option>
          </select>
        </div>
      </div>

      {isPending && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading…
        </p>
      )}

      {entries.length === 0 && !isPending ? (
        <EmptyState icon={MessageSquare} title={labels.admin.chatMonitorEmpty} />
      ) : (
        <ResponsiveTable
          mobile={entries.map((entry) => (
            <ResponsiveTableCard key={entry.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold">{entry.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(entry.createdAt)}
                  </p>
                </div>
                <Badge
                  variant={
                    entry.role === "ASSISTANT" ? "secondary" : "outline"
                  }
                >
                  {entry.role === "ASSISTANT"
                    ? labels.admin.chatMonitorRoleAssistant
                    : labels.admin.chatMonitorRoleUser}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {entry.groupTitle ?? labels.admin.chatMonitorGeneralChat}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                {entry.message}
              </p>
            </ResponsiveTableCard>
          ))}
          desktop={
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium">Student</th>
                    <th className="px-4 py-3 text-start font-medium">Group</th>
                    <th className="px-4 py-3 text-start font-medium">Role</th>
                    <th className="px-4 py-3 text-start font-medium">Message</th>
                    <th className="px-4 py-3 text-end font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-4 py-3 font-medium">{entry.userName}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {entry.groupTitle ?? labels.admin.chatMonitorGeneralChat}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            entry.role === "ASSISTANT" ? "secondary" : "outline"
                          }
                        >
                          {entry.role === "ASSISTANT"
                            ? labels.admin.chatMonitorRoleAssistant
                            : labels.admin.chatMonitorRoleUser}
                        </Badge>
                      </td>
                      <td
                        className={cn(
                          "max-w-md px-4 py-3",
                          entry.role === "ASSISTANT" && "text-muted-foreground"
                        )}
                      >
                        <p className="line-clamp-3 whitespace-pre-wrap">
                          {entry.message}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-end text-muted-foreground">
                        {formatDateTime(entry.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        />
      )}
    </div>
  );
}
