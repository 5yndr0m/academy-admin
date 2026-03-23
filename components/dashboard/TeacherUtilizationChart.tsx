"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import type { TeacherUtilizationData } from "@/types";

interface TeacherUtilizationChartProps {
  data: TeacherUtilizationData[];
}

function barColor(pct: number) {
  if (pct >= 85) return "#10b981";
  if (pct >= 60) return "#f59e0b";
  return "#ef4444";
}

function shortName(name: string) {
  return name.replace(/^(Dr\.|Ms\.|Mr\.)\s/, "").split(" ")[0];
}

export function TeacherUtilizationChart({ data }: TeacherUtilizationChartProps) {
  const totalAssigned  = data.reduce((s, d) => s + d.assignedHours, 0);
  const totalConducted = data.reduce((s, d) => s + d.conductedHours, 0);
  const overallPct     = Math.round((totalConducted / totalAssigned) * 100);
  const freeSlots      = totalAssigned - totalConducted;

  const donutData = [
    { value: totalConducted,                         color: "#6366f1" },
    { value: Math.max(0, totalAssigned - totalConducted), color: "transparent" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Users className="h-4 w-4" />
          Teacher Utilization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Overall donut + summary stats */}
        <div className="flex items-center gap-4">
          <div className="relative h-[80px] w-[80px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={38}
                  dataKey="value"
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {donutData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.color}
                      stroke={entry.color === "transparent" ? "hsl(var(--muted))" : entry.color}
                      strokeWidth={entry.color === "transparent" ? 1 : 0}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm font-bold">{overallPct}%</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Overall utilization rate</p>
            <p className="text-sm font-semibold">
              {totalConducted}h{" "}
              <span className="text-muted-foreground font-normal">of {totalAssigned}h conducted</span>
            </p>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">{freeSlots}h</strong> free slots remaining
              </p>
            </div>
          </div>
        </div>

        {/* Per-teacher breakdown bars */}
        <div className="space-y-2">
          {data.map((d) => {
            const pct = d.utilizationPercent;
            return (
              <div key={d.teacherName} className="space-y-0.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground truncate max-w-[150px]">{shortName(d.teacherName)}</span>
                  <span className="font-semibold shrink-0 ml-2">{pct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor(pct) }}
                  />
                </div>
              </div>
            );
          })}
        </div>

      </CardContent>
    </Card>
  );
}
