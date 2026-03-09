"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WeeklySchedule, ClassSchedule } from "@/types";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DISPLAY_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface WeekTimetableProps {
  weeklySchedule: WeeklySchedule;
}

// Collect all unique time slots across all days, sorted
function collectTimeSlots(schedule: WeeklySchedule): string[] {
  const slots = new Set<string>();
  Object.values(schedule).forEach((daySlots) => {
    daySlots.forEach((s) => slots.add(`${s.start_time}–${s.end_time}`));
  });
  return Array.from(slots).sort();
}

function SlotCell({ slots }: { slots: ClassSchedule[] }) {
  if (!slots || slots.length === 0) return null;
  return (
    <div className="space-y-1">
      {slots.map((s) => (
        <div
          key={s.id}
          className="text-xs p-2 rounded-md bg-accent/50 border border-accent leading-tight"
        >
          <span className="font-medium">{s.class?.name ?? "Class"}</span>
          {s.class?.teacher && (
            <span className="text-muted-foreground">
              {" "}
              · {s.class.teacher.full_name}
            </span>
          )}
          {s.classroom && (
            <div className="text-muted-foreground">{s.classroom.name}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export function WeekTimetable({ weeklySchedule }: WeekTimetableProps) {
  const timeSlots = collectTimeSlots(weeklySchedule);
  const hasData = timeSlots.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Master Schedule</CardTitle>
        <CardDescription>
          All recurring class schedules for the week.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recurring schedules set up yet.
          </p>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Time</TableHead>
                  {DISPLAY_DAYS.map((day) => (
                    <TableHead key={day} className="min-w-[150px]">
                      {day}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeSlots.map((timeSlot) => {
                  const [start, end] = timeSlot.split("–");
                  return (
                    <TableRow key={timeSlot}>
                      <TableCell className="font-medium text-xs text-muted-foreground font-mono align-top pt-3">
                        {start}
                        <br />
                        {end}
                      </TableCell>
                      {DISPLAY_DAYS.map((day) => {
                        // Match slots for this day + this time window
                        const daySlots = (weeklySchedule[day] ?? []).filter(
                          (s) => s.start_time === start && s.end_time === end,
                        );
                        return (
                          <TableCell key={day} className="align-top pt-2">
                            <SlotCell slots={daySlots} />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
