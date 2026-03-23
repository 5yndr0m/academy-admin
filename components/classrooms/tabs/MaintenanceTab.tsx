"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { classroomService } from "@/lib/data";
import type { ClassroomMaintenanceRecord } from "@/types";
import { Plus, Loader2, AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface MaintenanceTabProps {
  classroomId: string;
  records: ClassroomMaintenanceRecord[];
  onChanged: () => void;
}

type Status = ClassroomMaintenanceRecord["status"];

const STATUS_CONFIG: Record<Status, { label: string; color: string; next?: Status; nextLabel?: string; Icon: React.ElementType }> = {
  REPORTED:    { label: "Reported",    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",      next: "IN_PROGRESS", nextLabel: "Start",    Icon: AlertTriangle },
  IN_PROGRESS: { label: "In Progress", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", next: "COMPLETED",   nextLabel: "Complete", Icon: Clock },
  COMPLETED:   { label: "Completed",   color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",                                              Icon: CheckCircle },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function MaintenanceTab({ classroomId, records, onChanged }: MaintenanceTabProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await classroomService.addMaintenance(classroomId, { title, description });
      setReportOpen(false);
      setTitle("");
      setDescription("");
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  const handleAdvance = async (rec: ClassroomMaintenanceRecord, next: Status) => {
    setUpdatingId(rec.id);
    try {
      await classroomService.updateMaintenanceStatus(classroomId, rec.id, next);
      onChanged();
    } finally {
      setUpdatingId(null);
    }
  };

  const open = records.filter((r) => r.status !== "COMPLETED");
  const completed = records.filter((r) => r.status === "COMPLETED");

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {open.length} open · {completed.length} resolved
        </p>
        <Button size="sm" variant="outline" onClick={() => setReportOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Report Issue
        </Button>
      </div>

      {records.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No maintenance records. All clear!</p>
      ) : (
        <div className="space-y-2">
          {records.map((rec) => {
            const cfg = STATUS_CONFIG[rec.status];
            const Icon = cfg.icon ?? cfg.Icon;
            return (
              <div key={rec.id} className="rounded-lg border px-3 py-2.5 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-sm font-medium truncate">{rec.title}</span>
                  </div>
                  <Badge className={`text-[10px] px-1.5 py-0 shrink-0 ${cfg.color}`}>{cfg.label}</Badge>
                </div>
                {rec.description && (
                  <p className="text-xs text-muted-foreground pl-5">{rec.description}</p>
                )}
                <div className="flex items-center justify-between pl-5">
                  <span className="text-[11px] text-muted-foreground">
                    {rec.reported_by?.name ?? rec.reported_by?.username ?? "—"} · {fmtDate(rec.created_at)}
                  </span>
                  {cfg.next && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[11px] px-2"
                      disabled={updatingId === rec.id}
                      onClick={() => handleAdvance(rec, cfg.next!)}
                    >
                      {updatingId === rec.id
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : cfg.nextLabel
                      }
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleReport}>
            <DialogHeader>
              <DialogTitle>Report Maintenance Issue</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="m-title">Issue title</Label>
                <Input id="m-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Projector bulb burnt out" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-desc">Description (optional)</Label>
                <Textarea id="m-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional details..." rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
