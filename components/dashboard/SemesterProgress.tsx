"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarRange, Users } from "lucide-react";

export interface BatchInfo {
  label: string;        // e.g. "2025/26 Intake"
  year: 1 | 2 | 3 | 4; // current year of study
  studentCount: number;
  isActive: boolean;
}

interface SemesterProgressProps {
  data: {
    name: string;
    academicYear: string;
    startDate: string; // "YYYY-MM-DD"
    endDate: string;   // "YYYY-MM-DD"
    batches: BatchInfo[];
  };
}

const YEAR_COLORS: Record<number, { dot: string; badge: string; text: string }> = {
  1: { dot: "bg-blue-500",   badge: "bg-blue-100 dark:bg-blue-900/30",   text: "text-blue-700 dark:text-blue-300"   },
  2: { dot: "bg-emerald-500",badge: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
  3: { dot: "bg-purple-500", badge: "bg-purple-100 dark:bg-purple-900/30",text: "text-purple-700 dark:text-purple-300" },
  4: { dot: "bg-orange-500", badge: "bg-orange-100 dark:bg-orange-900/30",text: "text-orange-700 dark:text-orange-300" },
};

export function SemesterProgress({ data }: SemesterProgressProps) {
  const { pct, totalWeeks, weeksElapsed, weeksLeft, daysLeft } = useMemo(() => {
    const start     = new Date(data.startDate).getTime();
    const end       = new Date(data.endDate).getTime();
    const now       = new Date().getTime();
    const totalMs   = end - start;
    const elapsedMs = Math.max(0, Math.min(now - start, totalMs));
    const totalW    = Math.round(totalMs / (7 * 86_400_000));
    const elapsedW  = Math.round(elapsedMs / (7 * 86_400_000));
    return {
      pct:          Math.round((elapsedMs / totalMs) * 100),
      totalWeeks:   totalW,
      weeksElapsed: elapsedW,
      weeksLeft:    Math.max(0, totalW - elapsedW),
      daysLeft:     Math.max(0, Math.round((end - now) / 86_400_000)),
    };
  }, [data.startDate, data.endDate]);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  const totalStudents = data.batches.reduce((s, b) => s + b.studentCount, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <CalendarRange className="h-4 w-4" />
          Semester Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">

        {/* Semester name + % */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-base">{data.name}</p>
            <p className="text-xs text-muted-foreground">{data.academicYear}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold">{pct}%</p>
            <p className="text-xs text-muted-foreground">complete</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{fmtDate(data.startDate)}</span>
            <span>{fmtDate(data.endDate)}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Week",       value: `${weeksElapsed}/${totalWeeks}` },
            { label: "Weeks left", value: String(weeksLeft) },
            { label: "Days left",  value: String(daysLeft) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-md bg-muted/60 px-2 py-1.5 text-center">
              <p className="text-sm font-semibold">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Batch breakdown */}
        {data.batches.length > 0 && (
          <div className="pt-1 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-0.5">
              <span className="font-semibold uppercase tracking-wider">Active Batches</span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {totalStudents} total
              </span>
            </div>
            {data.batches.map((batch) => {
              const c = YEAR_COLORS[batch.year] ?? YEAR_COLORS[1];
              return (
                <div
                  key={batch.label}
                  className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 bg-muted/40"
                >
                  {/* Year dot */}
                  <span className={`h-2 w-2 rounded-full shrink-0 ${c.dot}`} />

                  {/* Year badge */}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.badge} ${c.text} shrink-0`}>
                    Y{batch.year}
                  </span>

                  {/* Label */}
                  <span className="text-xs flex-1 truncate">{batch.label}</span>

                  {/* Count */}
                  <span className="text-xs font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {batch.studentCount}
                  </span>
                </div>
              );
            })}
          </div>
        )}

      </CardContent>
    </Card>
  );
}
