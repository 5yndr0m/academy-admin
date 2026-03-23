"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import type { ClassroomUtilizationData } from "@/types";
import { useChartColors } from "@/lib/chart-theme";

interface ClassroomUtilizationChartProps {
  data: ClassroomUtilizationData[];
}

type Period = "7d" | "30d" | "semester";

function barColor(pct: number) {
  if (pct >= 70) return "#10b981"; // emerald
  if (pct >= 40) return "#f59e0b"; // amber
  return "#ef4444";                // red
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: ClassroomUtilizationData }[] }) {
  const colors = useChartColors();
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ClassroomUtilizationData;
  return (
    <div style={{ background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, color: colors.tooltipText }} className="rounded-lg px-3 py-2 shadow-md text-xs space-y-0.5">
      <p className="font-semibold">{d.classroomName}</p>
      <p style={{ color: colors.axis }}>{d.utilizationPercent}% utilized</p>
      <p style={{ color: colors.axis }}>{d.sessionsHeld} sessions held</p>
    </div>
  );
}

export function ClassroomUtilizationChart({ data }: ClassroomUtilizationChartProps) {
  const [period, setPeriod] = useState<Period>("7d");
  const colors = useChartColors();

  const periodLabels: Record<Period, string> = {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "semester": "This semester",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Building2 className="h-4 w-4" />
            Classroom Utilization
          </CardTitle>
          <div className="flex gap-1">
            {(["7d", "30d", "semester"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  period === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-1">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> ≥70% good</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500 inline-block" /> 40–69% moderate</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500 inline-block" /> &lt;40% low</span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
            <XAxis
              dataKey="classroomName"
              tick={{ fontSize: 11, fill: colors.axis }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: colors.axis }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: colors.grid, radius: 4 }} />
            <Bar dataKey="utilizationPercent" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={barColor(entry.utilizationPercent)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
