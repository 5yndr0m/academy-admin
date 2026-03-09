"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { MonthlyReport } from "@/types";

interface StatsCardsProps {
  counts: {
    students: number;
    teachers: number;
    active_classes: number;
  };
  financial: MonthlyReport | null;
}

export function StatsCards({ counts, financial }: StatsCardsProps) {
  const collected = financial?.total_collected ?? 0;
  const pending = financial?.pending_invoices?.amount ?? 0;
  const pendingCount = financial?.pending_invoices?.count ?? 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Monthly Collections
          </CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700 font-mono">
            LKR {collected.toLocaleString()}
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            MTD Actuals
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Outstanding
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-700 font-mono">
            LKR {pending.toLocaleString()}
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            {pendingCount} invoice{pendingCount !== 1 ? "s" : ""} awaiting
            payment
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Enrolled Students
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{counts.students}</div>
          <p className="text-xs text-muted-foreground">Total across academy</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Teachers / Classes
          </CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {counts.teachers} / {counts.active_classes}
          </div>
          <p className="text-xs text-muted-foreground">
            Active teachers / active classes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
