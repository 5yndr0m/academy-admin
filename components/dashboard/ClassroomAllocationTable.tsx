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
import { Building2 } from "lucide-react";
import type { ClassroomAllocationRow } from "@/types";

interface ClassroomAllocationTableProps {
  data: ClassroomAllocationRow[];
}

function UtilBadge({ pct }: { pct: number }) {
  const cls =
    pct >= 85
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : pct >= 50
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cls}`}>{pct}%</span>
  );
}

export function ClassroomAllocationTable({ data }: ClassroomAllocationTableProps) {
  const totalFreeSeats = data.reduce((s, r) => s + Math.max(0, r.capacity - r.studentsCount), 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Building2 className="h-4 w-4" />
          Classroom Allocation
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {totalFreeSeats} free seats across all scheduled rooms
        </p>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">Room</TableHead>
              <TableHead className="text-[11px] text-right">Cap.</TableHead>
              <TableHead className="text-[11px]">Class</TableHead>
              <TableHead className="text-[11px]">Teacher</TableHead>
              <TableHead className="text-[11px]">Day</TableHead>
              <TableHead className="text-[11px]">Time</TableHead>
              <TableHead className="text-[11px] text-right">Students</TableHead>
              <TableHead className="text-[11px] text-right">Util.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i} className="text-xs">
                <TableCell className="font-medium">{row.room}</TableCell>
                <TableCell className="text-right text-muted-foreground">{row.capacity}</TableCell>
                <TableCell className="max-w-[120px] truncate">{row.className}</TableCell>
                <TableCell className="max-w-[130px] truncate text-muted-foreground">
                  {row.teacherName}
                </TableCell>
                <TableCell>{row.day}</TableCell>
                <TableCell className="text-muted-foreground">{row.time}</TableCell>
                <TableCell className="text-right">{row.studentsCount}</TableCell>
                <TableCell className="text-right">
                  <UtilBadge pct={row.utilizationPercent} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
