"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { classService, teacherService, subjectService } from "@/lib/data";
import { Class, Teacher, Subject } from "@/types";
import { AddClassDialog } from "./AddClassDialog";
import { Loader2, Pencil, Search, RefreshCw } from "lucide-react";

export function ClassList() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

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
    if (search !== undefined) {
      setSearching(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await classService.getAll(search);
      setClasses(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load classes");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Handle search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        load(searchQuery.trim());
      } else {
        load();
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, load]);

  const handleToggle = async (cls: Class) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === cls.id
          ? { ...c, status: c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
          : c,
      ),
    );
    try {
      await classService.toggleStatus(cls.id);
    } catch {
      // Revert on failure
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
      teacherService.getAll(),
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
      setClasses((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
      setEditing(null);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 p-8">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={() => load()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              All Classes
              {classes.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({classes.length})
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Manage classes and their instructors, fees, and status.
              {searchQuery && (
                <span className="block text-xs mt-1 text-muted-foreground">
                  Found {classes.length} class{classes.length === 1 ? "" : "es"}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-3"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="h-9 px-2 text-muted-foreground hover:text-foreground"
                title="Clear search"
              >
                ×
              </Button>
            )}
            <AddClassDialog onAdded={load} />
          </div>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
              <div className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50 flex items-center justify-center">
                📚
              </div>
              <h3 className="font-medium text-lg mb-2 text-foreground">
                {searchQuery ? "No matching classes" : "No classes yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery
                  ? `No classes found matching "${searchQuery}". Try a different search term.`
                  : "Create your first class to get started."}
              </p>
              {!searchQuery && <AddClassDialog onAdded={load} />}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Monthly Fee</TableHead>
                  <TableHead>Payout %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => {
                  const teacherName =
                    cls.teacher?.full_name ??
                    (cls.teacher as any)?.fullname ??
                    "—";
                  const subjectName = cls.subject?.name ?? "—";
                  return (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell className="text-sm">{teacherName}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-normal text-xs"
                        >
                          {subjectName}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        LKR {cls.base_monthly_fee.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">
                          {cls.payout_percentage}%
                        </span>
                        <p className="text-[10px] text-muted-foreground">
                          LKR{" "}
                          {(
                            (cls.base_monthly_fee * cls.payout_percentage) /
                            100
                          ).toLocaleString()}{" "}
                          / student
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={cls.status === "ACTIVE"}
                            onCheckedChange={() => handleToggle(cls)}
                            title="Toggle active/inactive"
                          />
                          <Badge
                            variant={
                              cls.status === "ACTIVE" ? "secondary" : "outline"
                            }
                            className={
                              cls.status === "ACTIVE"
                                ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-700 text-[10px]"
                                : "text-[10px] text-muted-foreground"
                            }
                          >
                            {cls.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(cls)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
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
                      <Select
                        value={editTeacher}
                        onValueChange={setEditTeacher}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.full_name ?? (t as any).fullname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Subject</Label>
                    <div className="col-span-3">
                      <Select
                        value={editSubject}
                        onValueChange={setEditSubject}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Fee (LKR)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editFee}
                      onChange={(e) => setEditFee(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Payout %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={editPayout}
                      onChange={(e) => setEditPayout(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                </>
              )}
              {editError && (
                <p className="text-sm text-destructive text-center">
                  {editError}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
