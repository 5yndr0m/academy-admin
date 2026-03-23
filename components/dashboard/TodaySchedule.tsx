"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users } from "lucide-react";
import type { TodaySession } from "@/types";

interface TodayScheduleProps {
  data: TodaySession[];
}

const statusConfig: Record<
  TodaySession["status"],
  { label: string; className: string }
> = {
  ACTIVE:    { label: "Active",     className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200" },
  SCHEDULED: { label: "Upcoming",   className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200" },
  COMPLETED: { label: "Completed",  className: "bg-muted text-muted-foreground border-border" },
  CANCELLED: { label: "Cancelled",  className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200" },
};

export function TodaySchedule({ data }: TodayScheduleProps) {
  const sorted = [...data].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <CalendarDays className="h-4 w-4" />
          Today&apos;s Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto max-h-[340px] pr-1">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No sessions scheduled for today.</p>
        ) : (
          <div className="space-y-2">
            {sorted.map((session) => {
              const cfg = statusConfig[session.status];
              const isActive = session.status === "ACTIVE";
              return (
                <div
                  key={session.sessionId}
                  className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                    isActive ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-border bg-card"
                  }`}
                >
                  {/* Time */}
                  <div className="w-20 shrink-0 text-center">
                    <div className="text-xs font-mono font-semibold text-foreground">{session.startTime}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{session.endTime}</div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{session.subjectName}</p>
                        <p className="text-xs text-muted-foreground truncate">{session.lecturerName}</p>
                      </div>
                      <Badge variant="outline" className={`shrink-0 text-[10px] px-1.5 py-0 ${cfg.className}`}>
                        {cfg.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                      <span className="font-medium">{session.classroom}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {session.enrolledCount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
