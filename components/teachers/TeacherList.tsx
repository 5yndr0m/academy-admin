"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { teacherService } from "@/lib/data";
import { Teacher } from "@/types";
import { AddTeacherDialog } from "./AddTeacherDialog";
import { UpdateTeacherDialog } from "./UpdateTeacherDialog";
import { ScheduleManager } from "./ScheduleManager";
import { LecturerProfileSheet } from "./LecturerProfileSheet";
import { Loader2, UserCheck, Mail, Phone, ExternalLink } from "lucide-react";

export function TeacherList() {
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const { data: teachers, loading, error, refetch } = useAsyncData(
    () => teacherService.getAll(),
    []
  );

  const handleToggleStatus = async (id: string) => {
    setTogglingId(id);
    try {
      await teacherService.toggleStatus(id);
      await refetch();
    } finally {
      setTogglingId(null);
    }
  };

  const columns: Column<Teacher>[] = [
    {
      key: "full_name",
      header: "Teacher",
      cell: (t) => (
        <div className="space-y-1">
          <p className="font-medium">{t.full_name}</p>
          <StatusBadge status={t.status} />
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      cell: (t) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            {t.contact_number}
          </div>
          {t.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              {t.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "subjects",
      header: "Subjects",
      sortable: false,
      cell: (t) =>
        t.subjects && t.subjects.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {t.subjects.map((s) => (
              <Badge key={s.id} variant="secondary" className="text-xs font-normal">
                {s.name}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">None assigned</span>
        ),
    },
    {
      key: "actions",
      header: "",
      sortable: false,
      headerClassName: "w-10",
      cell: (t) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedTeacher(t)}
            title="View full profile"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <UpdateTeacherDialog teacher={t} onUpdated={refetch} />
          <Button
            variant="ghost"
            size="sm"
            disabled={togglingId === t.id}
            onClick={() => handleToggleStatus(t.id)}
            className="text-xs"
          >
            {togglingId === t.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : t.status === "ACTIVE" ? (
              "Deactivate"
            ) : (
              "Activate"
            )}
          </Button>
          <ScheduleManager teacher={t} onUpdate={refetch} />
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
              <CardTitle>Faculty Directory</CardTitle>
              <CardDescription>
                Manage teachers, their contact details, and class schedules.
              </CardDescription>
            </div>
            <AddTeacherDialog onAdded={refetch} />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={teachers ?? []}
            rowKey={(t) => t.id}
            loading={loading}
            error={error}
            onRetry={refetch}
            searchPlaceholder="Search by name, email, contact, or subject…"
            emptyIcon={UserCheck}
            emptyTitle="No teachers yet"
            emptyDescription="Add your first teacher to get started."
          />
        </CardContent>
      </Card>

      <LecturerProfileSheet
        teacher={selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
      />
    </>
  );
}
