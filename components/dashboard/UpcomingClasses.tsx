"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClassSession } from "@/types";

interface UpcomingClassesProps {
  sessions: ClassSession[];
}

export function UpcomingClasses({ sessions }: UpcomingClassesProps) {
  // Sort by start_time ascending so earliest class is first
  const sorted = [...sessions].sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Classes</CardTitle>
        <CardDescription>All sessions scheduled for today.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No classes scheduled for today.
            </p>
          ) : (
            sorted.map((session) => (
              <div
                key={session.id}
                className="grid grid-cols-[90px_1fr_auto] items-center gap-4 border-b last:border-0 pb-4 last:pb-0"
              >
                {/* Time */}
                <span className="text-xs font-medium bg-muted px-2 py-1 rounded text-center font-mono">
                  {session.start_time} – {session.end_time}
                </span>

                {/* Class info */}
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">
                    {session.class?.name ?? "Unnamed Class"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.class?.teacher
                      ? session.class.teacher.full_name
                      : "Unknown teacher"}
                  </p>
                </div>

                {/* Room */}
                <Badge
                  variant="outline"
                  className="text-xs font-normal shrink-0"
                >
                  {session.classroom?.name ?? "TBD"}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
