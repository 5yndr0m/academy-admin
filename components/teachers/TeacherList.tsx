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
import { teacherService } from "@/lib/data";
import { Teacher } from "@/types";
import { AddTeacherDialog } from "./AddTeacherDialog";
import { ScheduleManager } from "./ScheduleManager";
import { Loader2 } from "lucide-react";

export function TeacherList() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teacherService.getAll();
      setTeachers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load teachers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Faculty Directory</CardTitle>
          <CardDescription>
            Manage teachers and their class schedules.
          </CardDescription>
        </div>
        <AddTeacherDialog onAdded={load} />
      </CardHeader>
      <CardContent>
        {teachers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No teachers added yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">
                    {/* backend returns "fullname" (no underscore) on nested objects */}
                    {teacher.full_name ?? (teacher as any).fullname}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {teacher.contact_number}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects && teacher.subjects.length > 0 ? (
                        teacher.subjects.map((sub) => (
                          <Badge
                            key={sub.id}
                            variant="outline"
                            className="font-normal text-xs"
                          >
                            {sub.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <ScheduleManager teacher={teacher} onUpdate={load} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
