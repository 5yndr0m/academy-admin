"use client";

import { useEffect, useState, useCallback } from "react";
import { curriculumService, lecturerService, semesterService } from "@/lib/data";
import type { CurriculumItem, LecturerSubjectAllocation, Semester } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, Circle, Trash2, Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface CurriculumTabProps {
  teacherId: string;
}

export function CurriculumTab({ teacherId }: CurriculumTabProps) {
  const [items, setItems] = useState<CurriculumItem[]>([]);
  const [allocations, setAllocations] = useState<LecturerSubjectAllocation[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addAllocation, setAddAllocation] = useState("");
  const [addTopic, setAddTopic] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addWeek, setAddWeek] = useState("1");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    semesterService.getAll().then(setSemesters).catch(() => {});
    lecturerService.getAllocations(teacherId).then(setAllocations).catch(() => {});
  }, [teacherId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const semId = selectedSemester !== "ALL" ? selectedSemester : undefined;
      const data = await curriculumService.getItems(teacherId, semId ? { semester_id: semId } : undefined);
      setItems(data);
    } catch {
      setError("Failed to load curriculum");
    } finally {
      setLoading(false);
    }
  }, [teacherId, selectedSemester]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (item: CurriculumItem) => {
    setTogglingId(item.id);
    try {
      if (!item.is_completed) {
        await curriculumService.complete(item.id);
      } else {
        await curriculumService.update(item.id, { is_completed: false });
      }
      await load();
    } catch {
      // ignore
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await curriculumService.delete(id);
      await load();
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdd = async () => {
    if (!addAllocation || !addTopic || !addWeek) {
      setAddError("Allocation, topic, and week number are required");
      return;
    }
    setAddLoading(true);
    setAddError(null);
    try {
      await curriculumService.create({
        allocation_id: addAllocation,
        topic: addTopic,
        description: addDescription || undefined,
        week_number: parseInt(addWeek),
      });
      setAddOpen(false);
      setAddTopic("");
      setAddDescription("");
      setAddWeek("1");
      await load();
    } catch (e: unknown) {
      setAddError(e instanceof Error ? e.message : "Failed to add item");
    } finally {
      setAddLoading(false);
    }
  };

  // Group by week
  const byWeek = items.reduce<Record<number, CurriculumItem[]>>((acc, item) => {
    (acc[item.week_number] ??= []).push(item);
    return acc;
  }, {});
  const weeks = Object.keys(byWeek).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
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
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Add Topic
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive text-center">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No curriculum items found.</p>
      ) : (
        <div className="space-y-4">
          {weeks.map((week) => (
            <div key={week}>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Week {week}</p>
              <div className="space-y-1">
                {byWeek[week].map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-2.5 rounded-md border px-3 py-2 ${item.is_completed ? "opacity-60" : ""}`}
                  >
                    <button
                      className="mt-0.5 shrink-0"
                      onClick={() => handleToggle(item)}
                      disabled={togglingId === item.id}
                    >
                      {togglingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : item.is_completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${item.is_completed ? "line-through" : ""}`}>
                        {item.topic}
                      </p>
                      {item.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                      )}
                      {item.subject_name && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.subject_name}</p>
                      )}
                    </div>
                    <button
                      className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Add Curriculum Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Allocation (Subject / Semester)</Label>
              <Select value={addAllocation} onValueChange={setAddAllocation}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select allocation…" />
                </SelectTrigger>
                <SelectContent>
                  {allocations.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.subject_name} — {a.semester_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Topic</Label>
              <Input
                value={addTopic}
                onChange={(e) => setAddTopic(e.target.value)}
                className="h-8 text-sm"
                placeholder="e.g. Introduction to Data Structures"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description (optional)</Label>
              <Textarea
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}
                rows={2}
                placeholder="What will be covered…"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Week Number</Label>
              <Input
                type="number"
                min={1}
                value={addWeek}
                onChange={(e) => setAddWeek(e.target.value)}
                className="h-8 text-sm w-24"
              />
            </div>
            {addError && <p className="text-sm text-destructive">{addError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={addLoading}>
              {addLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Topic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
