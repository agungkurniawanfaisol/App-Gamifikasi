"use client";

import { useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import type { ChatMonitorEntry } from "@/actions/admin/chat-monitor";
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
  });
}

export function ChatMonitorPanel({
  entries,
  students,
}: {
  entries: ChatMonitorEntry[];
  students: { id: number; name: string }[];
}) {
  const [studentFilter, setStudentFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (studentFilter === "all") return entries;
    const userId = parseInt(studentFilter, 10);
    if (Number.isNaN(userId)) return entries;
    return entries.filter((entry) => entry.userId === userId);
  }, [entries, studentFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:max-w-xs">
        <Label htmlFor="chat-student-filter">
          {labels.admin.chatMonitorFilterStudent}
        </Label>
        <select
          id="chat-student-filter"
          value={studentFilter}
          onChange={(e) => setStudentFilter(e.target.value)}
          className="native-select h-11"
        >
          <option value="all">{labels.admin.chatMonitorAllStudents}</option>
          {students.map((student) => (
            <option key={student.id} value={String(student.id)}>
              {student.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={MessageSquare} title={labels.admin.chatMonitorEmpty} />
      ) : (
        <ResponsiveTable
          mobile={filtered.map((entry) => (
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
              {entry.groupTitle && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {entry.groupTitle}
                </p>
              )}
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
                  {filtered.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-4 py-3 font-medium">{entry.userName}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {entry.groupTitle ?? "—"}
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
