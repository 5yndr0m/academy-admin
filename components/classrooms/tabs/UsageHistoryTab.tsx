"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { classroomService } from "@/lib/data";
import type { ClassSession } from "@/types";
import { Loader2 } from "lucide-react";

interface UsageHistoryTabProps {
  classroomId: string;
}

type Period = "7d" | "30d" | "90d";

const PERIOD_OPTIONS: { value: Period; label: string; days: number }[] = [
  { value: "7d",  label: "Last 7 days",  days: 7  },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
];

const STATUS_STYLES: Record<string, string> = {
  COMPLETED:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  ACTIVE:     "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  SCHEDULED:  "bg-muted text-muted-foreground",
  CANCELLED:  "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export function UsageHistoryTab({ classroomId }: UsageHistoryTabProps) {
  const [period, setPeriod] = useState<Period>("30d");
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const days = PERIOD_OPTIONS.find((p) => p.value === period)!.days;
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      const fmt = (d: Date) => d.toISOString().split("T")[0];
      const data = await classroomService.getHistory(classroomId, fmt(fromDate), fmt(toDate));
      setSessions(data);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [classroomId, period]);

  useEffect(() => { load(); }, [load]);

  const completed = sessions.filter((s) => s.status === "COMPLETED").length;
  const cancelled = sessions.filter((s) => s.status === "CANCELLED").length;

  return (
    <div className="space-y-3 pt-2">
      {/* Period selector */}
      <div className="flex gap-1.5">
        {PERIOD_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            size="sm"
            variant={period === opt.value ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => setPeriod(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Summary stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Total",     value: sessions.length },
            { label: "Completed", value: completed },
            { label: "Cancelled", value: cancelled },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-md bg-muted/60 px-2 py-1.5 text-center">
              <p className="text-sm font-semibold">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Session list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No sessions in this period.</p>
      ) : (
        <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
              <div className="min-w-[52px] text-center">
                <p className="text-xs font-semibold">{fmtDate(s.session_date)}</p>
                <p className="text-[10px] text-muted-foreground">{s.start_time}–{s.end_time}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{s.class?.name ?? "—"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{s.class?.teacher?.full_name ?? ""}</p>
              </div>
              <Badge className={`text-[9px] px-1.5 py-0 shrink-0 ${STATUS_STYLES[s.status] ?? ""}`}>
                {s.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
