"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClassSession } from "@/types";
import { sessionService } from "@/lib/data";
import { Calendar, Clock, AlertTriangle, X, Settings } from "lucide-react";
import { useState } from "react";

interface TodayClass {
  id: string;
  start_time: string;
  end_time: string;
  class?: {
    name: string;
    teacher?: {
      full_name: string;
    };
  };
  classroom?: {
    name: string;
  };
  is_schedule?: boolean;
}

interface UpcomingClassesProps {
  sessions: (ClassSession | TodayClass)[] | null;
  sessionGenerationNeeded?: boolean;
  onRefresh?: () => void;
}

export function UpcomingClasses({
  sessions,
  sessionGenerationNeeded = false,
  onRefresh,
}: UpcomingClassesProps) {
  const [generating, setGenerating] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  // Sort by start_time ascending so earliest class is first
  const sorted = [...(sessions || [])].sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );

  const handleGenerateSessions = async () => {
    setGenerating(true);
    try {
      const today = new Date();
      const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week from now

      await sessionService.generate({
        start_date: today.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      });

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to generate sessions:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    setCancelling(sessionId);
    try {
      await sessionService.cancel(sessionId);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to cancel session:", error);
    } finally {
      setCancelling(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today&apos;s Classes
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => (window.location.href = "/sessions")}
          >
            <Settings className="h-3 w-3 mr-1" />
            Manage Sessions
          </Button>
        </div>
        <CardDescription>
          {sessionGenerationNeeded
            ? "Scheduled classes from recurring schedules. Generate sessions to enable attendance tracking."
            : "All sessions scheduled for today."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessionGenerationNeeded && (
            <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm text-amber-800 dark:text-amber-200">
                  Sessions need to be generated from schedules for attendance
                  tracking.
                </span>
                <Button
                  size="sm"
                  onClick={handleGenerateSessions}
                  disabled={generating}
                  className="ml-2"
                >
                  {generating ? "Generating..." : "Generate Sessions"}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No classes scheduled for today.
            </p>
          ) : (
            sorted.map((session) => {
              const isFromSchedule =
                "is_schedule" in session && session.is_schedule;
              return (
                <div
                  key={session.id}
                  className={`grid grid-cols-[90px_1fr_auto] items-center gap-4 border-b last:border-0 pb-4 last:pb-0 ${
                    isFromSchedule ? "opacity-75" : ""
                  }`}
                >
                  {/* Time */}
                  <span className="text-xs font-medium bg-muted px-2 py-1 rounded text-center font-mono flex items-center gap-1">
                    {isFromSchedule && (
                      <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    )}
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
                    {isFromSchedule && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        From recurring schedule
                      </p>
                    )}
                  </div>

                  {/* Room & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={isFromSchedule ? "secondary" : "outline"}
                      className="text-xs font-normal"
                    >
                      {session.classroom?.name ?? "TBD"}
                    </Badge>
                    {!isFromSchedule && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelSession(session.id)}
                        disabled={cancelling === session.id}
                        className="h-6 w-6 p-0 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
