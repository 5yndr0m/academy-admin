"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import type { AttendanceTrendPoint } from "@/types";
import { useChartColors } from "@/lib/chart-theme";

interface AttendanceTrendChartProps {
  data: AttendanceTrendPoint[];
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { payload: AttendanceTrendPoint }[]; label?: string }) {
  const colors = useChartColors();
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as AttendanceTrendPoint;
  return (
    <div style={{ background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, color: colors.tooltipText }} className="rounded-lg px-3 py-2 shadow-md text-xs space-y-0.5">
      <p className="font-semibold">{label}</p>
      <p style={{ color: colors.axis }}>{d.attendancePercent}% attendance</p>
      <p style={{ color: colors.axis }}>{d.sessionCount} sessions</p>
    </div>
  );
}

export function AttendanceTrendChart({ data }: AttendanceTrendChartProps) {
  const avg = Math.round(data.reduce((s, d) => s + d.attendancePercent, 0) / data.length);
  const colors = useChartColors();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <UserCheck className="h-4 w-4" />
            Attendance Trend
          </CardTitle>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>Avg: <strong className="text-foreground">{avg}%</strong></span>
            <span className="flex items-center gap-1">
              <span className="h-px w-5 border-t-2 border-dashed border-amber-500 inline-block" />
              80% target
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: colors.axis }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[60, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: colors.axis }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine
              y={80}
              stroke="#f59e0b"
              strokeDasharray="5 4"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="attendancePercent"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#attendanceGrad)"
              dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
