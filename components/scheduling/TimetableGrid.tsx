"use client";

import { useEffect, useState, useCallback } from "react";
import { sessionService } from "@/lib/data";
import type { ClassSession } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "border-l-blue-400",
  ACTIVE: "border-l-green-500",
  COMPLETED: "border-l-gray-300",
  CANCELLED: "border-l-red-400 opacity-50",
};

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // adjust to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface TimetableGridProps {
  onSessionClick: (session: ClassSession) => void;
  refreshKey: number;
}

export function TimetableGrid({ onSessionClick, refreshKey }: TimetableGridProps) {
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sessionService.getByDateRange(formatDate(weekStart), formatDate(weekEnd));
      setSessions(data);
    } catch {
      setError("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, refreshKey]);

  useEffect(() => { load(); }, [load]);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const goToday = () => setWeekStart(getWeekStart(new Date()));

  // Group sessions by day of week (0=Mon…6=Sun)
  const byDay: ClassSession[][] = Array.from({ length: 7 }, () => []);
  sessions.forEach((s) => {
    const d = new Date(s.session_date);
    const dayIdx = (d.getDay() + 6) % 7; // convert Sun=0 to Mon=0
    byDay[dayIdx].push(s);
  });

  // Sort sessions within each day by start time
  byDay.forEach((day) => day.sort((a, b) => a.start_time.localeCompare(b.start_time)));

  const weekLabel = `${weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${weekEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[200px] text-center">{weekLabel}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={goToday}>
          Today
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive text-center py-8">{error}</p>
      ) : (
        <div className="grid grid-cols-7 gap-2 min-h-[400px]">
          {DAYS.map((day, i) => {
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + i);
            const isToday = formatDate(dayDate) === formatDate(new Date());
            const daySessions = byDay[i];

            return (
              <div key={day} className="min-h-[200px]">
                {/* Day header */}
                <div className={`text-center py-2 mb-2 rounded-md text-xs font-medium ${isToday ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <div>{day}</div>
                  <div className={`text-[10px] mt-0.5 ${isToday ? "opacity-80" : "text-muted-foreground"}`}>
                    {dayDate.getDate()}
                  </div>
                </div>

                {/* Sessions */}
                <div className="space-y-1.5">
                  {daySessions.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground text-center py-2">—</p>
                  ) : (
                    daySessions.map((s) => (
                      <button
                        key={s.id}
                        className={`w-full text-left border-l-2 pl-2 pr-1 py-1.5 rounded-r-md bg-card hover:bg-accent transition-colors cursor-pointer ${STATUS_COLORS[s.status] ?? ""}`}
                        onClick={() => onSessionClick(s)}
                      >
                        <p className="text-[11px] font-medium leading-tight truncate">
                          {(s as ClassSession & { class?: { name?: string } }).class?.name ?? "Session"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {s.start_time}–{s.end_time}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {(s as ClassSession & { classroom?: { name?: string } }).classroom?.name ?? ""}
                        </p>
                        <Badge
                          variant="outline"
                          className={`mt-1 text-[9px] px-1 py-0 ${
                            s.status === "ACTIVE" ? "bg-green-100 text-green-700 border-green-200" :
                            s.status === "COMPLETED" ? "bg-gray-100 text-gray-500" :
                            s.status === "CANCELLED" ? "bg-red-100 text-red-600 border-red-200" :
                            "bg-blue-100 text-blue-700 border-blue-200"
                          }`}
                        >
                          {s.status}
                        </Badge>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
