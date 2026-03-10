"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
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
import { studentService } from "@/lib/data";
import { Student } from "@/types";
import { AddStudentDialog } from "./AddStudentDialog";
import { StudentDetailsModal } from "./StudentDetailsModal";

export function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.fullname ?? "").toLowerCase().includes(q) ||
      s.admission_no?.toLowerCase().includes(q) ||
      s.contact_number?.toLowerCase().includes(q) ||
      s.guardian_name?.toLowerCase().includes(q)
    );
  });

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
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <div>
          <CardTitle>Student Roster</CardTitle>
          <CardDescription>
            {students.length} student{students.length !== 1 ? "s" : ""} enrolled
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name, ID, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 h-9 text-sm"
          />
          <AddStudentDialog onAdded={load} />
        </div>
      </CardHeader>

      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {search
              ? "No students match your search."
              : "No students enrolled yet."}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Adm. No</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Admission Fee</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {student.admission_no || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">
                      {student.fullname}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {student.contact_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{student.guardian_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {student.guardian_contact}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        student.admission_fee_paid
                          ? "bg-green-50 text-green-700 border-green-200 text-[10px]"
                          : "bg-amber-50 text-amber-700 border-amber-200 text-[10px]"
                      }
                    >
                      {student.admission_fee_paid ? "Paid" : "Unpaid"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {student.registration_date
                      ? new Date(student.registration_date).toLocaleDateString()
                      : new Date(student.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <StudentDetailsModal
                      studentId={student.id}
                      onUpdate={load}
                    />
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
