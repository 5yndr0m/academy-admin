"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import type { ClassEnrollmentStat } from "@/types";
import { useChartColors } from "@/lib/chart-theme";

interface ClassStatsPieChartProps {
  data: ClassEnrollmentStat[];
}

const SEGMENTS = [
  { key: "FULL",      label: "Full",      color: "#10b981" },
  { key: "HALF_FULL", label: "Half Full", color: "#f59e0b" },
  { key: "LOW",       label: "Low",       color: "#ef4444" },
] as const;

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { percent: number } }[];
}) {
  const colors = useChartColors();
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div
      style={{
        background: colors.tooltipBg,
        border: `1px solid ${colors.tooltipBorder}`,
        color: colors.tooltipText,
      }}
      className="rounded-lg px-3 py-2 shadow-md text-xs space-y-0.5"
    >
      <p className="font-semibold">{name}</p>
      <p>{value} class{value !== 1 ? "es" : ""}</p>
      <p style={{ color: colors.axis }}>{(p.percent * 100).toFixed(0)}% of total</p>
    </div>
  );
}

export function ClassStatsPieChart({ data }: ClassStatsPieChartProps) {
  const colors = useChartColors();
  const chartData = SEGMENTS.map(({ key, label, color }) => ({
    name: label,
    value: data.filter((d) => d.fillStatus === key).length,
    color,
  }));
  const total = data.length;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <BookOpen className="h-4 w-4" />
          Class Enrollment Status
        </CardTitle>
        <p className="text-xs text-muted-foreground">{total} active classes this semester</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", color: colors.legend }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center -mt-4">
          <p className="text-xs text-muted-foreground">Total Classes</p>
          <p className="text-lg font-bold">{total}</p>
        </div>
      </CardContent>
    </Card>
  );
}
