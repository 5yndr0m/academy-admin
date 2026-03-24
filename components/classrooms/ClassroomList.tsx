"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorDisplay } from "@/components/ui/error-display";
import { classroomService } from "@/lib/data";
import { Classroom } from "@/types";
import { AddClassroomDialog } from "./AddClassroomDialog";
import { Loader2, Pencil, RefreshCw, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClassroomListProps {
  onViewDetails?: (classroom: Classroom) => void;
}

export function ClassroomList({ onViewDetails }: ClassroomListProps) {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingOccupancy, setRefreshingOccupancy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      const [allRooms, availableRoomsData] = await Promise.all([
        classroomService.getAll(),
        classroomService.getAvailable(),
      ]);
      setClassrooms(allRooms);
      setAvailableRooms(availableRoomsData.map((room) => room.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load classrooms");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshOccupancy = useCallback(async () => {
    setRefreshingOccupancy(true);
    try {
      const data = await classroomService.getAvailable();
      setAvailableRooms(data.map((room) => room.id));
    } finally {
      setRefreshingOccupancy(false);
    }
  }, []);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(refreshOccupancy, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load, refreshOccupancy]);

  const handleToggle = async (id: string) => {
    setClassrooms((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_usable: !c.is_usable } : c))
    );
    try {
      await classroomService.toggleUsability(id);
    } catch {
      setClassrooms((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_usable: !c.is_usable } : c))
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
      setClassrooms((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditing(null);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  const columns: Column<Classroom>[] = [
    {
      key: "name",
      header: "Name",
      cell: (c) => <span className="font-medium">{c.name}</span>,
    },
    {
      key: "capacity",
      header: "Capacity",
      cell: (c) => `${c.capacity} students`,
    },
    {
      key: "status",
      header: "Status",
      sortable: false,
      cell: (c) => <StatusBadge status={c.is_usable ? "USABLE" : "UNUSABLE"} />,
    },
    {
      key: "occupancy",
      header: (
        <span>
          Occupancy{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (now){refreshingOccupancy && <Loader2 className="inline ml-1 h-3 w-3 animate-spin" />}
          </span>
        </span>
      ),
      sortable: false,
      cell: (c) =>
        !c.is_usable ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : (
          <StatusBadge status={availableRooms.includes(c.id) ? "AVAILABLE" : "OCCUPIED"} />
        ),
    },
    {
      key: "usable",
      header: "Usable",
      sortable: false,
      headerClassName: "text-right",
      className: "text-right",
      cell: (c) => (
        <Switch
          checked={c.is_usable}
          onCheckedChange={() => handleToggle(c.id)}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      sortable: false,
      headerClassName: "w-20",
      className: "text-right",
      cell: (c) => (
        <div className="flex items-center justify-end gap-1">
          {onViewDetails && (
            <Button variant="ghost" size="icon" onClick={() => onViewDetails(c)}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Classrooms</CardTitle>
              <CardDescription>
                Manage classroom availability and capacity. Occupancy updates every 30s.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshOccupancy}
                disabled={refreshingOccupancy}
              >
                {refreshingOccupancy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
              <AddClassroomDialog onAdded={load} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={classrooms}
            rowKey={(c) => c.id}
            loading={loading}
            error={error}
            onRetry={load}
            searchPlaceholder="Search classrooms…"
            emptyTitle="No classrooms yet"
            emptyDescription="Add your first classroom to get started."
          />
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Classroom</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-capacity" className="text-right">Capacity</Label>
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
              {editError && <ErrorDisplay message={editError} />}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
