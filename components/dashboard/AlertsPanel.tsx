"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Wrench, FileText, UserX } from "lucide-react";

export type AlertSeverity = "critical" | "warning" | "info";

export interface DashboardAlert {
  id: string;
  severity: AlertSeverity;
  icon: "attendance" | "maintenance" | "report" | "student";
  title: string;
  detail: string;
  count: number;
}

interface AlertsPanelProps {
  alerts: DashboardAlert[];
}

const severityConfig: Record<AlertSeverity, { badge: string; border: string }> = {
  critical: {
    badge:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200",
    border: "border-l-red-500",
  },
  warning: {
    badge:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200",
    border: "border-l-amber-500",
  },
  info: {
    badge:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200",
    border: "border-l-blue-400",
  },
};

const IconMap: Record<DashboardAlert["icon"], React.ReactNode> = {
  attendance:  <Clock className="h-4 w-4" />,
  maintenance: <Wrench className="h-4 w-4" />,
  report:      <FileText className="h-4 w-4" />,
  student:     <UserX className="h-4 w-4" />,
};

const severityLabel: Record<AlertSeverity, string> = {
  critical: "Critical",
  warning:  "Warning",
  info:     "Info",
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const criticals = alerts.filter((a) => a.severity === "critical").length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Alerts &amp; Flags
          {criticals > 0 && (
            <Badge className="ml-auto text-[10px] px-1.5 py-0 bg-red-500 text-white hover:bg-red-500">
              {criticals} critical
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">All clear — no flags at this time.</p>
        ) : (
          alerts.map((alert) => {
            const cfg = severityConfig[alert.severity];
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 rounded-md border border-l-4 p-3 ${cfg.border} bg-card`}
              >
                <div className="mt-0.5 text-muted-foreground shrink-0">
                  {IconMap[alert.icon]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cfg.badge}`}>
                      {severityLabel[alert.severity]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.detail}</p>
                </div>
                {alert.count > 1 && (
                  <div className="shrink-0 text-right">
                    <span className="text-lg font-bold">{alert.count}</span>
                    <p className="text-[10px] text-muted-foreground leading-none">items</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
