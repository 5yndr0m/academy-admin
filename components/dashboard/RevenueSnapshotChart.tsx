"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import type { RevenueSnapshotData } from "@/types";
import { useChartColors } from "@/lib/chart-theme";

interface RevenueSnapshotChartProps {
  data: RevenueSnapshotData;
}

const SLICES = [
  { key: "teacherPayouts",    label: "Teacher Payouts",    color: "#f59e0b" },
  { key: "staffCommissions",  label: "Staff Commissions",  color: "#8b5cf6" },
  { key: "expenses",          label: "Expenses",           color: "#ef4444" },
  { key: "netIncome",         label: "Net Income",         color: "#10b981" },
];

function fmt(v: number) {
  if (v >= 1_000_000) return `LKR ${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `LKR ${(v / 1_000).toFixed(0)}K`;
  return `LKR ${v}`;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { percent: number } }[] }) {
  const colors = useChartColors();
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div style={{ background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, color: colors.tooltipText }} className="rounded-lg px-3 py-2 shadow-md text-xs space-y-0.5">
      <p className="font-semibold">{name}</p>
      <p>{fmt(value)}</p>
      <p style={{ color: colors.axis }}>{(p.percent * 100).toFixed(1)}% of revenue</p>
    </div>
  );
}

export function RevenueSnapshotChart({ data }: RevenueSnapshotChartProps) {
  const colors = useChartColors();
  const chartData = SLICES.map(({ key, label, color }) => ({
    name: label,
    value: data[key as keyof RevenueSnapshotData],
    color,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <TrendingUp className="h-4 w-4" />
          Revenue Snapshot
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Total collected: <strong className="text-foreground">{fmt(data.studentRevenue)}</strong>
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
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
        {/* Centre label — net income */}
        <div className="mt-0 text-center -mt-4">
          <p className="text-xs text-muted-foreground">Net Income</p>
          <p className="text-lg font-bold text-emerald-600">{fmt(data.netIncome)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
