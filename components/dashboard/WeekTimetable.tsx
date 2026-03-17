"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { WeeklySchedule, ClassSchedule } from "@/types";
import { Clock, MapPin, User, BookOpen } from "lucide-react";

const DISPLAY_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOUR_HEIGHT = 64; // px per hour
const TIME_COL_W = 52; // px
const DAY_COL_MIN_W = 160; // px — enforces horizontal scroll on narrow screens

// ── colour palette ────────────────────────────────────────────────────────────
const PALETTES = [
  { bg: "bg-blue-100 dark:bg-blue-900/50",     border: "border-blue-400 dark:border-blue-500",     text: "text-blue-900 dark:text-blue-100"     },
  { bg: "bg-green-100 dark:bg-green-900/50",   border: "border-green-400 dark:border-green-500",   text: "text-green-900 dark:text-green-100"   },
  { bg: "bg-purple-100 dark:bg-purple-900/50", border: "border-purple-400 dark:border-purple-500", text: "text-purple-900 dark:text-purple-100" },
  { bg: "bg-orange-100 dark:bg-orange-900/50", border: "border-orange-400 dark:border-orange-500", text: "text-orange-900 dark:text-orange-100" },
  { bg: "bg-pink-100 dark:bg-pink-900/50",     border: "border-pink-400 dark:border-pink-500",     text: "text-pink-900 dark:text-pink-100"     },
  { bg: "bg-teal-100 dark:bg-teal-900/50",     border: "border-teal-400 dark:border-teal-500",     text: "text-teal-900 dark:text-teal-100"     },
  { bg: "bg-yellow-100 dark:bg-yellow-900/50", border: "border-yellow-400 dark:border-yellow-500", text: "text-yellow-900 dark:text-yellow-100" },
  { bg: "bg-red-100 dark:bg-red-900/50",       border: "border-red-400 dark:border-red-500",       text: "text-red-900 dark:text-red-100"       },
  { bg: "bg-indigo-100 dark:bg-indigo-900/50", border: "border-indigo-400 dark:border-indigo-500", text: "text-indigo-900 dark:text-indigo-100" },
  { bg: "bg-cyan-100 dark:bg-cyan-900/50",     border: "border-cyan-400 dark:border-cyan-500",     text: "text-cyan-900 dark:text-cyan-100"     },
];

function buildColorMap(schedule: WeeklySchedule): Map<string, typeof PALETTES[0]> {
  const ids: string[] = [];
  Object.values(schedule).forEach((slots) =>
    slots.forEach((s) => { if (!ids.includes(s.class_id)) ids.push(s.class_id); })
  );
  const map = new Map<string, typeof PALETTES[0]>();
  ids.forEach((id, i) => map.set(id, PALETTES[i % PALETTES.length]));
  return map;
}

// ── time helpers ──────────────────────────────────────────────────────────────
function toMin(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
function pad(n: number) { return n.toString().padStart(2, "0"); }

function durationLabel(start: string, end: string) {
  const mins = toMin(end) - toMin(start);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

// ── overlap layout ────────────────────────────────────────────────────────────
interface LayoutEvent { event: ClassSchedule; col: number; totalCols: number }

function layoutDay(events: ClassSchedule[]): LayoutEvent[] {
  const sorted = [...events].sort((a, b) => toMin(a.start_time) - toMin(b.start_time));
  const columnEnds: number[] = [];

  // First pass: assign each event a column
  const withCol = sorted.map((event) => {
    const start = toMin(event.start_time);
    let col = columnEnds.findIndex((end) => end <= start);
    if (col === -1) col = columnEnds.length;
    columnEnds[col] = toMin(event.end_time);
    return { event, col };
  });

  // Second pass: totalCols is the max column index among all events that
  // overlap *this* event, so non-overlapping events get full width.
  return withCol.map(({ event, col }) => {
    const s = toMin(event.start_time);
    const e = toMin(event.end_time);
    const concurrentCols = withCol
      .filter(({ event: o }) => toMin(o.start_time) < e && toMin(o.end_time) > s)
      .map((o) => o.col);
    const totalCols = Math.max(...concurrentCols) + 1;
    return { event, col, totalCols };
  });
}

// ── hour range from data ──────────────────────────────────────────────────────
function hourRange(schedule: WeeklySchedule) {
  let minH = 24, maxH = 0;
  Object.values(schedule).forEach((slots) =>
    slots.forEach((s) => {
      const sh = Math.floor(toMin(s.start_time) / 60);
      const eh = Math.ceil(toMin(s.end_time) / 60);
      if (sh < minH) minH = sh;
      if (eh > maxH) maxH = eh;
    })
  );
  return minH < maxH ? { minH, maxH } : { minH: 8, maxH: 18 };
}

// ── event detail popover ──────────────────────────────────────────────────────
function EventPopover({
  event,
  palette,
  top,
  height,
  leftPct,
  widthPct,
}: {
  event: ClassSchedule;
  palette: typeof PALETTES[0];
  top: number;
  height: number;
  leftPct: number;
  widthPct: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={`absolute rounded-md border-l-2 px-1.5 py-1 overflow-hidden cursor-pointer transition-opacity hover:opacity-90 hover:shadow-md ${palette.bg} ${palette.border} ${palette.text}`}
          style={{
            top,
            height,
            left: `calc(${leftPct}% + 2px)`,
            width: `calc(${widthPct}% - 4px)`,
          }}
          onClick={() => setOpen(true)}
        >
          <div className="text-[11px] font-semibold leading-tight truncate">
            {event.class?.name ?? "Class"}
          </div>
          <div className="text-[10px] opacity-70 leading-tight truncate">
            {event.start_time}–{event.end_time}
          </div>
          {height >= 48 && event.class?.teacher && (
            <div className="text-[10px] opacity-60 leading-tight truncate">
              {event.class.teacher.full_name}
            </div>
          )}
          {height >= 64 && event.classroom && (
            <div className="text-[10px] opacity-60 leading-tight truncate">
              {event.classroom.name}
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" side="right" align="start">
        {/* Coloured header strip */}
        <div className={`px-4 py-3 rounded-t-md border-b ${palette.bg} ${palette.text}`}>
          <div className="font-semibold text-sm">{event.class?.name ?? "Class"}</div>
          {event.class?.subject && (
            <div className="text-xs opacity-70">{event.class.subject.name}</div>
          )}
        </div>
        <div className="px-4 py-3 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>
              {event.start_time} – {event.end_time}
              <span className="ml-1 text-xs opacity-60">
                ({durationLabel(event.start_time, event.end_time)})
              </span>
            </span>
          </div>
          {event.class?.teacher && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span>{event.class.teacher.full_name}</span>
            </div>
          )}
          {event.classroom && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{event.classroom.name}</span>
            </div>
          )}
          {event.class?.base_monthly_fee !== undefined && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              <span>LKR {event.class.base_monthly_fee.toLocaleString()} / month</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── main component ────────────────────────────────────────────────────────────
interface WeekTimetableProps {
  weeklySchedule: WeeklySchedule;
}

export function WeekTimetable({ weeklySchedule }: WeekTimetableProps) {
  const hasData = Object.values(weeklySchedule).some((s) => s.length > 0);
  const colorMap = buildColorMap(weeklySchedule);
  const { minH, maxH } = hourRange(weeklySchedule);
  const hours = Array.from({ length: maxH - minH }, (_, i) => minH + i);
  const gridH = hours.length * HOUR_HEIGHT;
  const todayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Master Schedule</CardTitle>
        <CardDescription>All recurring class schedules. Click any class for details.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 pb-4">
        {!hasData ? (
          <p className="text-sm text-muted-foreground text-center py-8 px-6">
            No recurring schedules set up yet.
          </p>
        ) : (
          <div className="overflow-x-auto w-full">
            <div style={{ minWidth: TIME_COL_W + DISPLAY_DAYS.length * DAY_COL_MIN_W }}>
              {/* ── Day header row ── */}
              <div className="flex border-b sticky top-0 bg-card z-10" style={{ paddingLeft: TIME_COL_W }}>
                {DISPLAY_DAYS.map((day) => (
                  <div
                    key={day}
                    style={{ minWidth: DAY_COL_MIN_W }}
                    className={`flex-1 text-center py-2 text-xs font-semibold uppercase tracking-wide ${
                      day === todayName ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {day.slice(0, 3)}
                    {day === todayName && (
                      <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-primary align-middle" />
                    )}
                  </div>
                ))}
              </div>

              {/* ── Grid body ── */}
              <div className="flex" style={{ height: gridH }}>
                {/* Time labels */}
                <div className="relative shrink-0" style={{ width: TIME_COL_W }}>
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="absolute right-2 text-[10px] text-muted-foreground font-mono"
                      style={{ top: (h - minH) * HOUR_HEIGHT - 7 }}
                    >
                      {pad(h)}:00
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {DISPLAY_DAYS.map((day) => {
                  const laid = layoutDay(weeklySchedule[day] ?? []);
                  return (
                    <div
                      key={day}
                      className={`relative flex-1 border-l ${day === todayName ? "bg-primary/5" : ""}`}
                      style={{ minWidth: DAY_COL_MIN_W }}
                    >
                      {/* Hour grid lines */}
                      {hours.map((h) => (
                        <div
                          key={h}
                          className="absolute left-0 right-0 border-t border-border/50"
                          style={{ top: (h - minH) * HOUR_HEIGHT }}
                        />
                      ))}

                      {/* Events */}
                      {laid.map(({ event, col, totalCols }) => {
                        const palette = colorMap.get(event.class_id) ?? PALETTES[0];
                        const startMin = toMin(event.start_time);
                        const endMin = toMin(event.end_time);
                        const top = ((startMin - minH * 60) / 60) * HOUR_HEIGHT;
                        const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT - 2, 20);
                        const leftPct = (col / totalCols) * 100;
                        const widthPct = (1 / totalCols) * 100;

                        return (
                          <EventPopover
                            key={event.id}
                            event={event}
                            palette={palette}
                            top={top}
                            height={height}
                            leftPct={leftPct}
                            widthPct={widthPct}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
