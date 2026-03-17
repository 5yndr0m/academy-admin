"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { financeOverviewService } from "@/lib/data";
import type { MonthlyOverviewResponse } from "@/types";

interface StatsCardsProps {
  counts: {
    students: number;
    teachers: number;
    active_classes: number;
  };
}

export function StatsCards({ counts }: StatsCardsProps) {
  const currentMonth = new Date().toISOString().substring(0, 7);
  const [financial, setFinancial] = useState<MonthlyOverviewResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    financeOverviewService.getMonthlyOverview(currentMonth).then((d) => {
      if (!cancelled) setFinancial(d);
    }).catch(() => {/* silently ignore — cards show 0 */});
    return () => { cancelled = true; };
  }, [currentMonth]);

  const collected = financial?.total_collected ?? 0;
  const income = financial?.institute_income ?? 0;
  const isPositive = income >= 0;

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
            LKR {collected.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            MTD Actuals
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Institute Income
          </CardTitle>
          <TrendingUp className={`h-4 w-4 ${isPositive ? "text-green-600" : "text-red-600"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold font-mono ${isPositive ? "text-green-700" : "text-red-700"}`}>
            LKR {Math.abs(income).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            After all deductions
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
