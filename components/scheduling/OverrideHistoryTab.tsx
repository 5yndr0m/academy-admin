"use client";

import { useEffect, useState, useCallback } from "react";
import { schedulingService } from "@/lib/data";
import type { ScheduleOverride } from "@/types";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const typeBadge: Record<string, string> = {
  DELAY: "bg-amber-100 text-amber-800 border-amber-200",
  RESCHEDULE: "bg-blue-100 text-blue-800 border-blue-200",
  EXTEND: "bg-purple-100 text-purple-800 border-purple-200",
  ROOM_CHANGE: "bg-teal-100 text-teal-800 border-teal-200",
  CANCELLATION: "bg-red-100 text-red-800 border-red-200",
};

function formatOverrideChange(o: ScheduleOverride): string {
  switch (o.type) {
    case "DELAY":
      return `${o.old_start_time} → ${o.new_start_time} (${o.old_end_time} → ${o.new_end_time})`;
    case "RESCHEDULE":
      return `${o.old_date} → ${o.new_date}`;
    case "EXTEND":
      return `End: ${o.old_end_time} → ${o.new_end_time}`;
    case "ROOM_CHANGE":
      return `${o.old_room_name ?? "?"} → ${o.new_room_name ?? "?"}`;
    case "CANCELLATION":
      return "Session cancelled";
    default:
      return "—";
  }
}

export function OverrideHistoryTab() {
  const [overrides, setOverrides] = useState<ScheduleOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await schedulingService.getOverrideHistory({
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setOverrides(result.overrides);
    } catch {
      setError("Failed to load override history");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">From</span>
          <Input
            type="date"
            className="h-8 text-xs w-36"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">To</span>
          <Input
            type="date"
            className="h-8 text-xs w-36"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive text-center py-4">{error}</p>
      ) : overrides.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No override history found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Class</TableHead>
                <TableHead className="text-xs">Session Date</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Change</TableHead>
                <TableHead className="text-xs">Reason</TableHead>
                <TableHead className="text-xs">By</TableHead>
                <TableHead className="text-xs">At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overrides.map((o) => (
                <TableRow key={o.id} className="text-xs">
                  <TableCell className="font-medium">{o.class_name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{o.session_date ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeBadge[o.type] ?? ""}`}>
                      {o.type.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-[11px]">
                    {formatOverrideChange(o)}
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate text-muted-foreground">
                    {o.reason ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.created_by_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("en-GB", {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
