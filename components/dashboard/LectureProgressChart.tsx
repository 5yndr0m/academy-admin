"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import type { LectureHoursData } from "@/types";
import { useChartColors } from "@/lib/chart-theme";

interface LectureProgressChartProps {
  data: LectureHoursData[];
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: LectureHoursData }[] }) {
  const colors = useChartColors();
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as LectureHoursData;
  const pct = Math.round((d.conductedHours / d.allocatedHours) * 100);
  return (
    <div style={{ background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, color: colors.tooltipText }} className="rounded-lg px-3 py-2 shadow-md text-xs space-y-0.5">
      <p className="font-semibold">{d.lecturerName}</p>
      <p style={{ color: colors.axis }}>{d.subject}</p>
      <p>Allocated: <strong>{d.allocatedHours}h</strong></p>
      <p>Conducted: <strong>{d.conductedHours}h</strong> ({pct}%)</p>
    </div>
  );
}

// Shorten lecturer names for axis labels
function shortName(name: string) {
  return name.replace(/^(Dr\.|Ms\.|Mr\.)\s/, "").split(" ")[0];
}

export function LectureProgressChart({ data }: LectureProgressChartProps) {
  const colors = useChartColors();
  const chartData = data.map((d) => ({
    ...d,
    shortName: shortName(d.lecturerName),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <GraduationCap className="h-4 w-4" />
          Lecture Hours — Conducted vs Allocated
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
            <XAxis
              dataKey="shortName"
              tick={{ fontSize: 11, fill: colors.axis }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${v}h`}
              tick={{ fontSize: 11, fill: colors.axis }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: colors.grid }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px", color: colors.legend }}
            />
            <Bar
              dataKey="allocatedHours"
              name="Allocated"
              fill="hsl(var(--muted-foreground))"
              fillOpacity={0.35}
              radius={[3, 3, 0, 0]}
              barSize={14}
            />
            <Bar
              dataKey="conductedHours"
              name="Conducted"
              fill="#6366f1"
              radius={[3, 3, 0, 0]}
              barSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
