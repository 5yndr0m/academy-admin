"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  User,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  Wallet,
  AlertTriangle,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { reportService } from "@/lib/data";
import { InstituteSummary } from "@/types";

function KPI({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className={`h-4 w-4 ${color ?? "text-muted-foreground"}`} />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function InstituteSummaryTab() {
  const [data, setData] = useState<InstituteSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    reportService
      .getInstituteSummary()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  if (error)
    return (
      <p className="text-sm text-destructive py-8 text-center">{error}</p>
    );
  if (!data) return null;

  const revenue = new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(data.revenue_this_month);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Institute Overview</h2>
        <p className="text-sm text-muted-foreground">
          Current state snapshot as of{" "}
          {new Date(data.generated_at).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI icon={Users} label="Active Students" value={data.active_students} color="text-blue-500" />
        <KPI icon={User} label="Active Teachers" value={data.active_teachers} color="text-violet-500" />
        <KPI icon={BookOpen} label="Active Classes" value={data.active_classes} color="text-emerald-500" />
        <KPI icon={CalendarDays} label="Active Semesters" value={data.active_semesters} color="text-amber-500" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI
          icon={CalendarCheck}
          label="Sessions This Month"
          value={data.sessions_this_month}
          sub="Completed"
          color="text-sky-500"
        />
        <KPI
          icon={TrendingUp}
          label="Attendance Rate"
          value={`${data.attendance_rate_this_month}%`}
          sub="This month"
          color={data.attendance_rate_this_month >= 80 ? "text-green-500" : "text-amber-500"}
        />
        <KPI
          icon={Wallet}
          label="Revenue This Month"
          value={revenue}
          sub="Student payments"
          color="text-green-500"
        />
        <KPI
          icon={AlertTriangle}
          label="Pending Conflicts"
          value={data.pending_conflicts}
          sub="Scheduling conflicts"
          color={data.pending_conflicts > 0 ? "text-destructive" : "text-muted-foreground"}
        />
      </div>
    </div>
  );
}
