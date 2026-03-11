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
import { Input } from "@/components/ui/input";
import { teacherService } from "@/lib/data";
import { Teacher } from "@/types";
import { AddTeacherDialog } from "./AddTeacherDialog";
import { UpdateTeacherDialog } from "./UpdateTeacherDialog";
import { ScheduleManager } from "./ScheduleManager";
import { Loader2, Search, UserCheck, UserX, Mail, Phone } from "lucide-react";

export function TeacherList() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teacherService.getAll();
      setAllTeachers(data);
      setTeachers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load teachers");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(() => {
    if (searching) return;
    setSearching(true);

    const searchValue = searchTerm.trim().toLowerCase();
    if (!searchValue) {
      setTeachers(allTeachers);
    } else {
      const filtered = allTeachers.filter(
        (teacher) =>
          teacher.full_name.toLowerCase().includes(searchValue) ||
          teacher.contact_number.includes(searchValue) ||
          (teacher.email &&
            teacher.email.toLowerCase().includes(searchValue)) ||
          (teacher.subjects &&
            teacher.subjects.some((subject) =>
              subject.name.toLowerCase().includes(searchValue),
            )),
      );
      setTeachers(filtered);
    }

    setSearching(false);
  }, [searching, searchTerm, allTeachers]);

  const handleClearSearch = () => {
    setSearchTerm("");
    setTeachers(allTeachers);
  };

  const handleToggleStatus = async (id: string) => {
    setTogglingId(id);
    try {
      await teacherService.toggleStatus(id);
      await load();
    } catch {
      setError("Failed to toggle teacher status");
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Faculty Directory
              {teachers.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({teachers.length})
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Manage teachers, their contact details, and class schedules.
              {teachers.length > 0 && (
                <span className="block text-xs mt-1 text-muted-foreground">
                  {searchTerm
                    ? `Found ${teachers.length} teacher${teachers.length === 1 ? "" : "s"}`
                    : `${allTeachers.length} total teachers`}
                </span>
              )}
            </CardDescription>
          </div>
          <AddTeacherDialog onAdded={load} />
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teachers by name, email, contact, or subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={searching}
            variant="outline"
            size="sm"
          >
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
          {searchTerm && (
            <Button onClick={handleClearSearch} variant="ghost" size="sm">
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive text-center py-4">{error}</p>
        )}

        {teachers.length === 0 && !loading ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-medium text-lg mb-2 text-foreground">
              {searchTerm ? "No matching teachers" : "No teachers yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm
                ? `No teachers found matching "${searchTerm}". Try a different search term.`
                : "Add your first teacher to get started."}
            </p>
            {!searchTerm && <AddTeacherDialog onAdded={load} />}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher Details</TableHead>
                <TableHead>Contact Information</TableHead>
                <TableHead>Subjects & Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Loading teachers...
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => (
                  <TableRow key={teacher.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {teacher.full_name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              teacher.status === "ACTIVE"
                                ? "outline"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {teacher.status === "ACTIVE" ? (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <UserX className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {teacher.contact_number}
                        </div>
                        {teacher.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {teacher.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects && teacher.subjects.length > 0 ? (
                          teacher.subjects.map((sub) => (
                            <Badge
                              key={sub.id}
                              variant="secondary"
                              className="font-normal text-xs"
                            >
                              {sub.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No subjects assigned
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <UpdateTeacherDialog
                          teacher={teacher}
                          onUpdated={load}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={togglingId === teacher.id}
                          onClick={() => handleToggleStatus(teacher.id)}
                          className="text-xs"
                        >
                          {togglingId === teacher.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : teacher.status === "ACTIVE" ? (
                            "Deactivate"
                          ) : (
                            "Activate"
                          )}
                        </Button>
                        <ScheduleManager teacher={teacher} onUpdate={load} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
