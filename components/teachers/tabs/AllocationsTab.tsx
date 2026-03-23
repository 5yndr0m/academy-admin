"use client";

import { useEffect, useState, useCallback } from "react";
import { lecturerService, semesterService } from "@/lib/data";
import type { LecturerSubjectAllocation, LecturerHoursEntry, Semester } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface AllocationsTabProps {
  teacherId: string;
}

function HoursBar({ entry }: { entry: LecturerHoursEntry }) {
  const pct = Math.min(entry.percent_done, 100);
  const color = pct >= 85 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#6366f1";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{entry.subject_name}</span>
        <span className="text-muted-foreground">
          {entry.conducted}h / {entry.allocated}h
          <span className="ml-1 font-semibold text-foreground">({entry.percent_done}%)</span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function AllocationsTab({ teacherId }: AllocationsTabProps) {
  const [allocations, setAllocations] = useState<LecturerSubjectAllocation[]>([]);
  const [hours, setHours] = useState<LecturerHoursEntry[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    semesterService.getAll().then(setSemesters).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const semId = selectedSemester !== "ALL" ? selectedSemester : undefined;
      const [allocs, hoursData] = await Promise.all([
        lecturerService.getAllocations(teacherId, semId),
        lecturerService.getHours(teacherId, semId),
      ]);
      setAllocations(allocs);
      setHours(hoursData.subjects);
    } catch {
      setError("Failed to load allocations");
    } finally {
      setLoading(false);
    }
  }, [teacherId, selectedSemester]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Subject allocations and hours tracking</p>
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-44 h-8 text-xs">
            <SelectValue placeholder="All semesters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All semesters</SelectItem>
            {semesters.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive text-center">{error}</p>
      ) : allocations.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No subject allocations found.
        </p>
      ) : (
        <div className="space-y-5">
          {/* Hours progress bars */}
          {hours.length > 0 && (
            <div className="space-y-3 rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground">Hours Progress</p>
              {hours.map((h) => (
                <HoursBar key={h.subject_id} entry={h} />
              ))}
            </div>
          )}

          {/* Allocation cards */}
          <div className="space-y-2">
            {allocations.map((a) => (
              <div key={a.id} className="rounded-lg border px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{a.subject_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.semester_name}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground shrink-0">
                    <div>{a.weekly_hours_allocated}h/week</div>
                    <div>{a.total_hours_allocated}h total</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
                    {a.conducted_hours}h conducted
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
