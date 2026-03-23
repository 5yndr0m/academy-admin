"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";
import type { TeacherAssignmentRow } from "@/types";

interface TeacherAssignmentTableProps {
  data: TeacherAssignmentRow[];
}

export function TeacherAssignmentTable({ data }: TeacherAssignmentTableProps) {
  // Group by teacher name preserving insertion order
  const grouped = data.reduce<Record<string, TeacherAssignmentRow[]>>((acc, row) => {
    (acc[row.teacherName] ??= []).push(row);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <GraduationCap className="h-4 w-4" />
          Teacher Assignments
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {Object.keys(grouped).length} teachers · {data.length} scheduled sessions
        </p>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">Teacher</TableHead>
              <TableHead className="text-[11px]">Subject</TableHead>
              <TableHead className="text-[11px]">Class</TableHead>
              <TableHead className="text-[11px]">Day</TableHead>
              <TableHead className="text-[11px]">Time</TableHead>
              <TableHead className="text-[11px]">Room</TableHead>
              <TableHead className="text-[11px] text-right">Students</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(grouped).map(([teacher, rows]) =>
              rows.map((row, ri) => (
                <TableRow
                  key={`${teacher}-${ri}`}
                  className={`text-xs ${ri === 0 && Object.keys(grouped).indexOf(teacher) > 0 ? "border-t-2" : ""}`}
                >
                  {ri === 0 ? (
                    <TableCell
                      className="align-top font-medium"
                      rowSpan={rows.length}
                    >
                      <div className="flex flex-col gap-1 pt-0.5">
                        <span className="leading-tight">{teacher}</span>
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0 w-fit font-normal"
                        >
                          {rows.length} session{rows.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </TableCell>
                  ) : null}
                  <TableCell className="text-muted-foreground">{row.subject}</TableCell>
                  <TableCell>{row.className}</TableCell>
                  <TableCell>{row.day}</TableCell>
                  <TableCell className="text-muted-foreground">{row.time}</TableCell>
                  <TableCell>{row.room}</TableCell>
                  <TableCell className="text-right">{row.studentsCount}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
