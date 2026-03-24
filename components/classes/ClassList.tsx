"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorDisplay } from "@/components/ui/error-display";
import { classService, teacherService, subjectService } from "@/lib/data";
import { Class, Teacher, Subject } from "@/types";
import { AddClassDialog } from "./AddClassDialog";
import { Loader2, Pencil } from "lucide-react";

export function ClassList() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Edit dialog
  const [editing, setEditing] = useState<Class | null>(null);
  const [editName, setEditName] = useState("");
  const [editFee, setEditFee] = useState("");
  const [editPayout, setEditPayout] = useState("");
  const [editTeacher, setEditTeacher] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [dropdownReady, setDropdownReady] = useState(false);

  const load = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await classService.getAll(search);
      setClasses(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load classes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Server-side search with debounce
  useEffect(() => {
    const t = setTimeout(() => {
      load(searchQuery.trim() || undefined);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, load]);

  const handleToggle = async (cls: Class) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === cls.id
          ? { ...c, status: c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
          : c
      )
    );
    try {
      await classService.toggleStatus(cls.id);
    } catch {
      setClasses((prev) => prev.map((c) => (c.id === cls.id ? cls : c)));
    }
  };

  const openEdit = async (cls: Class) => {
    setEditing(cls);
    setEditName(cls.name);
    setEditFee(String(cls.base_monthly_fee));
    setEditPayout(String(cls.payout_percentage));
    setEditTeacher(cls.teacher_id);
    setEditSubject(cls.subject_id);
    setEditError(null);
    setDropdownReady(false);
    const [t, s] = await Promise.all([
      teacherService.getAll(undefined, true),
      subjectService.getAll(),
    ]);
    setTeachers(t);
    setSubjects(s);
    setDropdownReady(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const updated = await classService.update(editing.id, {
        name: editName,
        base_monthly_fee: parseFloat(editFee),
        payout_percentage: parseFloat(editPayout),
        teacher_id: editTeacher,
        subject_id: editSubject,
      });
      setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditing(null);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  const columns: Column<Class>[] = [
    {
      key: "name",
      header: "Class",
      cell: (c) => <span className="font-medium">{c.name}</span>,
    },
    {
      key: "teacher",
      header: "Teacher",
      cell: (c) => (
        <span className="text-sm">
          {c.teacher?.full_name ?? (c.teacher as any)?.fullname ?? "—"}
        </span>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      sortable: false,
      cell: (c) => (
        <Badge variant="outline" className="font-normal text-xs">
          {c.subject?.name ?? "—"}
        </Badge>
      ),
    },
    {
      key: "base_monthly_fee",
      header: "Monthly Fee",
      cell: (c) => (
        <span className="font-mono text-sm">
          LKR {c.base_monthly_fee.toLocaleString()}
        </span>
      ),
    },
    {
      key: "payout_percentage",
      header: "Payout %",
      cell: (c) => (
        <div>
          <span className="text-sm font-mono">{c.payout_percentage}%</span>
          <p className="text-[10px] text-muted-foreground">
            LKR {((c.base_monthly_fee * c.payout_percentage) / 100).toLocaleString()} / student
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: false,
      cell: (c) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={c.status === "ACTIVE"}
            onCheckedChange={() => handleToggle(c)}
          />
          <StatusBadge status={c.status} />
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      sortable: false,
      headerClassName: "w-10",
      cell: (c) => (
        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Classes</CardTitle>
              <CardDescription>
                Manage classes and their instructors, fees, and status.
              </CardDescription>
            </div>
            <AddClassDialog onAdded={() => load(searchQuery || undefined)} />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={classes}
            rowKey={(c) => c.id}
            loading={loading}
            error={error}
            onRetry={() => load(searchQuery || undefined)}
            searchPlaceholder="Search classes…"
            emptyTitle="No classes found"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Class</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {!dropdownReady ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Name</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Teacher</Label>
                    <div className="col-span-3">
                      <Select value={editTeacher} onValueChange={setEditTeacher}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.length === 0 ? (
                            <SelectItem value="_" disabled>
                              No active teachers found
                            </SelectItem>
                          ) : (
                            teachers.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.full_name ?? (t as any).fullname}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Only active teachers are shown
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Subject</Label>
                    <div className="col-span-3">
                      <Select value={editSubject} onValueChange={setEditSubject}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.length === 0 ? (
                            <SelectItem value="_" disabled>
                              No subjects found
                            </SelectItem>
                          ) : (
                            subjects.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Fee (LKR)</Label>
                    <div className="col-span-3 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        LKR
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editFee}
                        onChange={(e) => setEditFee(e.target.value)}
                        className="pl-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Payout %</Label>
                    <div className="col-span-3 relative">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={editPayout}
                        onChange={(e) => setEditPayout(e.target.value)}
                        className="pr-8"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        %
                      </span>
                    </div>
                  </div>

                  {editFee && editPayout && !isNaN(parseFloat(editFee)) && !isNaN(parseFloat(editPayout)) && (
                    <div className="rounded-md bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
                      <div className="grid grid-cols-2 gap-1">
                        <span>Teacher receives:</span>
                        <span className="font-medium text-foreground text-right">
                          LKR {((parseFloat(editFee) * parseFloat(editPayout)) / 100).toLocaleString()}
                        </span>
                        <span>Institute retains:</span>
                        <span className="font-medium text-foreground text-right">
                          LKR {(parseFloat(editFee) * (1 - parseFloat(editPayout) / 100)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
              {editError && <ErrorDisplay message={editError} />}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editLoading || !dropdownReady || teachers.length === 0}>
                {editLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Class
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
