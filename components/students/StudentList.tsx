"use client";

import { Eye, CheckCircle2, AlertCircle, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { studentService } from "@/lib/data";
import { Student } from "@/types";
import { AddStudentDialog } from "./AddStudentDialog";
import { StudentDetailsModal } from "./StudentDetailsModal";

const columns: Column<Student>[] = [
  {
    key: "admission_no",
    header: "Admission No",
    cell: (s) => <span className="font-mono text-sm">{s.admission_no || "—"}</span>,
  },
  {
    key: "fullname",
    header: "Student Name",
    cell: (s) => <span className="font-medium">{s.fullname}</span>,
  },
  {
    key: "home_contact",
    header: "Home Contact",
    cell: (s) => s.home_contact,
  },
  {
    key: "guardian_name",
    header: "Guardian Name",
    cell: (s) => s.guardian_name,
  },
  {
    key: "guardian_contact",
    header: "Guardian Contact",
    cell: (s) => s.guardian_contact,
  },
  {
    key: "admission_fee_paid",
    header: "Admission Fee",
    sortable: false,
    cell: (s) =>
      s.admission_fee_paid ? (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm">Paid</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-amber-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Pending</span>
        </div>
      ),
  },
  {
    key: "registration_date",
    header: "Registered",
    cell: (s) =>
      new Date(s.registration_date || s.created_at).toLocaleDateString(),
  },
];

export function StudentList() {
  const { data: students, loading, error, refetch } = useAsyncData(
    () => studentService.getAll(),
    []
  );

  const withActions: Column<Student>[] = [
    ...columns,
    {
      key: "actions",
      header: "",
      sortable: false,
      headerClassName: "w-10",
      cell: (s) => (
        <StudentDetailsModal
          studentId={s.id}
          onUpdate={refetch}
          trigger={
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          }
        />
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Students</CardTitle>
          <AddStudentDialog onAdded={refetch} />
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={withActions}
          data={students ?? []}
          rowKey={(s) => s.id}
          loading={loading}
          error={error}
          onRetry={refetch}
          searchPlaceholder="Search by name, admission no, guardian…"
          emptyIcon={GraduationCap}
          emptyTitle="No students yet"
          emptyDescription="Add your first student to get started."
        />
      </CardContent>
    </Card>
  );
}
