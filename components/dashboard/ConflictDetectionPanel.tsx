"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import type { ConflictSummary } from "@/types";

interface ConflictDetectionPanelProps {
  conflicts: ConflictSummary[];
}

const TYPE_LABEL: Record<ConflictSummary["type"], string> = {
  DOUBLE_BOOKING:  "Double Booking",
  TEACHER_OVERLAP: "Teacher Overlap",
  ROOM_CONFLICT:   "Room Conflict",
};

const SEVERITY_STYLES: Record<ConflictSummary["severity"], { badge: string; dot: string }> = {
  HIGH:   { badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",      dot: "bg-red-500"   },
  MEDIUM: { badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", dot: "bg-amber-500" },
  LOW:    { badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",  dot: "bg-blue-500"  },
};

const STATUS_STYLES: Record<ConflictSummary["status"], { dot: string; label: string }> = {
  PENDING:  { dot: "bg-yellow-400", label: "Pending"  },
  RESOLVED: { dot: "bg-green-500",  label: "Resolved" },
  IGNORED:  { dot: "bg-gray-400",   label: "Ignored"  },
};

export function ConflictDetectionPanel({ conflicts }: ConflictDetectionPanelProps) {
  const pendingCount  = conflicts.filter((c) => c.status === "PENDING").length;
  const highPending   = conflicts.filter((c) => c.severity === "HIGH" && c.status === "PENDING").length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <AlertCircle className={`h-4 w-4 ${highPending > 0 ? "text-red-500" : "text-muted-foreground"}`} />
          Conflict Detection
          {pendingCount > 0 && (
            <Badge className="ml-auto text-[10px] px-1.5 py-0 bg-red-500 text-white hover:bg-red-500">
              {pendingCount} open
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {conflicts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No conflicts detected.</p>
        ) : (
          conflicts.map((c) => {
            const sev = SEVERITY_STYLES[c.severity];
            const sts = STATUS_STYLES[c.status];
            return (
              <div
                key={c.id}
                className="flex items-start gap-2.5 rounded-md border px-3 py-2 bg-muted/30"
              >
                <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${sev.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sev.badge}`}>
                      {c.severity}
                    </span>
                    <span className="text-xs font-medium">{TYPE_LABEL[c.type]}</span>
                    <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                      <span className={`h-1.5 w-1.5 rounded-full ${sts.dot}`} />
                      {sts.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {c.className} · {c.teacherName} · {c.roomName}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{c.day} {c.timeSlot}</p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
