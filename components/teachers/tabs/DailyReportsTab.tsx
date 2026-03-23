"use client";

import { useEffect, useState, useCallback } from "react";
import { dailyReportService } from "@/lib/data";
import type { LectureDailyReport } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, FileText } from "lucide-react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface DailyReportsTabProps {
  teacherId: string;
}

export function DailyReportsTab({ teacherId }: DailyReportsTabProps) {
  const [reports, setReports] = useState<LectureDailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addTopics, setAddTopics] = useState("");
  const [addNotes, setAddNotes] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dailyReportService.getForLecturer(teacherId, {
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setReports(result.reports);
    } catch {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [teacherId, fromDate, toDate]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!addTopics.trim()) {
      setAddError("Topics covered is required");
      return;
    }
    setAddLoading(true);
    setAddError(null);
    try {
      await dailyReportService.create({
        teacher_id: teacherId,
        topics_covered: addTopics,
        notes: addNotes || undefined,
      });
      setAddOpen(false);
      setAddTopics("");
      setAddNotes("");
      await load();
    } catch (e: unknown) {
      setAddError(e instanceof Error ? e.message : "Failed to submit report");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">From</span>
            <Input type="date" className="h-8 text-xs w-32" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">To</span>
            <Input type="date" className="h-8 text-xs w-32" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1 shrink-0" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Submit Report
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive text-center">{error}</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No reports found.</p>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.id} className="rounded-lg border px-3 py-2.5 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium">
                    {r.class_name ? r.class_name : "General Report"}
                    {r.session_date && (
                      <span className="ml-1 text-muted-foreground font-normal">— {r.session_date}</span>
                    )}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(r.submitted_at).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-xs text-foreground leading-relaxed">{r.topics_covered}</p>
              {r.notes && (
                <p className="text-[11px] text-muted-foreground italic">{r.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Submit Daily Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Topics Covered</Label>
              <Textarea
                value={addTopics}
                onChange={(e) => setAddTopics(e.target.value)}
                rows={4}
                placeholder="What was taught in today's session…"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notes (optional)</Label>
              <Textarea
                value={addNotes}
                onChange={(e) => setAddNotes(e.target.value)}
                rows={2}
                placeholder="Student participation, issues, next steps…"
              />
            </div>
            {addError && <p className="text-sm text-destructive">{addError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={addLoading}>
              {addLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
