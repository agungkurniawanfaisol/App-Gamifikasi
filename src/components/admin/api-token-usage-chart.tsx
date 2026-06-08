"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { UsageChartPoint } from "@/lib/external-api-audit";
import { labels } from "@/lib/labels";

export function ApiTokenUsageChart({ data }: { data: UsageChartPoint[] }) {
  const chartData = data.map((point) => ({
    ...point,
    label: point.date.slice(5),
  }));

  return (
    <div className="min-w-0 h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            className="fill-muted-foreground"
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
          />
          <Legend />
          <Bar
            dataKey="success"
            stackId="usage"
            fill="hsl(var(--primary))"
            name={labels.admin.apiTokensUsageChartSuccess}
          />
          <Bar
            dataKey="clientError"
            stackId="usage"
            fill="hsl(var(--destructive))"
            name={labels.admin.apiTokensUsageChartClientError}
          />
          <Bar
            dataKey="rateLimited"
            stackId="usage"
            fill="hsl(var(--muted-foreground))"
            name={labels.admin.apiTokensUsageChartRateLimited}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
