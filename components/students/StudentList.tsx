"use client";

import { useEffect, useState } from "react";
import { Eye, Loader2, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { studentService } from "@/lib/data";
import { Student } from "@/types";
import { AddStudentDialog } from "./AddStudentDialog";
import { StudentDetailsModal } from "./StudentDetailsModal";

export function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentService.getAll();
      setStudents(data);
      setFilteredStudents(data);
    } catch (err) {
      setError("Failed to load students");
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(
      (student) =>
        student.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.admission_no &&
          student.admission_no
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        student.home_contact.includes(searchTerm) ||
        student.guardian_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-destructive">{error}</p>
        <Button onClick={loadStudents} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Students ({filteredStudents.length})</CardTitle>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <AddStudentDialog
              onAdded={() => {
                loadStudents();
              }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm
                ? "No students found matching your search."
                : "No students added yet."}
            </p>
            {!searchTerm && (
              <AddStudentDialog
                onAdded={() => {
                  loadStudents();
                }}
              />
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admission No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Home Contact</TableHead>
                <TableHead>Guardian Name</TableHead>
                <TableHead>Guardian Contact</TableHead>
                <TableHead>Admission Fee</TableHead>
                <TableHead>Registered Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono text-sm">
                    {student.admission_no || "—"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {student.fullname}
                  </TableCell>
                  <TableCell>{student.home_contact}</TableCell>
                  <TableCell>{student.guardian_name}</TableCell>
                  <TableCell>{student.guardian_contact}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {student.admission_fee_paid ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          <span className="text-sm">Paid</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-amber-600">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm">Pending</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDate(
                      student.registration_date || student.created_at,
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <StudentDetailsModal
                      studentId={student.id}
                      onUpdate={loadStudents}
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      }
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
