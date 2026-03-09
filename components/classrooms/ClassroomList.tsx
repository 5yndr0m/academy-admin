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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { classroomService } from "@/lib/data";
import { Classroom } from "@/types";
import { AddClassroomDialog } from "./AddClassroomDialog";
import { Loader2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ClassroomList() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit dialog state
  const [editing, setEditing] = useState<Classroom | null>(null);
  const [editName, setEditName] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await classroomService.getAll();
      setClassrooms(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load classrooms",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Toggle is_usable — optimistic update then confirm from server
  const handleToggle = async (id: string) => {
    setClassrooms((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_usable: !c.is_usable } : c)),
    );
    try {
      await classroomService.toggleUsability(id);
    } catch {
      // Revert on failure
      setClassrooms((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_usable: !c.is_usable } : c)),
      );
    }
  };

  const openEdit = (classroom: Classroom) => {
    setEditing(classroom);
    setEditName(classroom.name);
    setEditCapacity(String(classroom.capacity));
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const updated = await classroomService.update(editing.id, {
        name: editName,
        capacity: parseInt(editCapacity) || 0,
        is_usable: editing.is_usable,
      });
      setClassrooms((prev) =>
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
        <Button variant="outline" size="sm" onClick={load}>
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
            <CardTitle>All Classrooms</CardTitle>
            <CardDescription>
              Manage classroom availability and capacity.
            </CardDescription>
          </div>
          <AddClassroomDialog onAdded={load} />
        </CardHeader>
        <CardContent>
          {classrooms.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No classrooms added yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Usable</TableHead>
                  <TableHead className="text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classrooms.map((classroom) => (
                  <TableRow key={classroom.id}>
                    <TableCell className="font-medium">
                      {classroom.name}
                    </TableCell>
                    <TableCell>{classroom.capacity} students</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          classroom.is_usable ? "secondary" : "destructive"
                        }
                        className={
                          classroom.is_usable
                            ? "bg-green-100 text-green-700"
                            : undefined
                        }
                      >
                        {classroom.is_usable ? "Usable" : "Unusable"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={classroom.is_usable}
                        onCheckedChange={() => handleToggle(classroom.id)}
                        title={
                          classroom.is_usable
                            ? "Mark as unusable"
                            : "Mark as usable"
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(classroom)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Classroom</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-capacity" className="text-right">
                  Capacity
                </Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  min={1}
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
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
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
