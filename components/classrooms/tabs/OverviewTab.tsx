"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import type { Classroom, ClassroomUtility, ClassroomMaintenanceRecord } from "@/types";
import { Users, Wrench, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface OverviewTabProps {
  classroom: Classroom;
  isOccupied: boolean;
  utilities: ClassroomUtility[];
  maintenance: ClassroomMaintenanceRecord[];
}

const UTILITY_LABELS: Record<string, string> = {
  AC: "AC",
  PROJECTOR: "Projector",
  SMARTBOARD: "Smartboard",
  WHITEBOARD: "Whiteboard",
  OTHER: "Other",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  REPORTED:    { label: "Reported",    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",      Icon: AlertTriangle },
  IN_PROGRESS: { label: "In Progress", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", Icon: Clock },
  COMPLETED:   { label: "Completed",   color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", Icon: CheckCircle },
};

export function OverviewTab({ classroom, isOccupied, utilities, maintenance }: OverviewTabProps) {
  const openIssues = maintenance.filter((m) => m.status !== "COMPLETED");
  const utilityGroups = utilities.reduce<Record<string, { total: number; broken: number }>>((acc, u) => {
    acc[u.utility_type] ??= { total: 0, broken: 0 };
    acc[u.utility_type].total += u.quantity;
    if (!u.is_functional) acc[u.utility_type].broken += u.quantity;
    return acc;
  }, {});

  return (
    <div className="space-y-5 pt-2">

      {/* Capacity + Occupancy */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border bg-muted/40 p-3 text-center">
          <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-2xl font-bold">{classroom.capacity}</p>
          <p className="text-xs text-muted-foreground">Seat capacity</p>
        </div>
        <div className="rounded-lg border bg-muted/40 p-3 text-center">
          <div className={`h-3 w-3 rounded-full mx-auto mb-1 ${isOccupied ? "bg-amber-400" : "bg-green-500"}`} />
          <p className="text-sm font-semibold">{isOccupied ? "Occupied" : "Available"}</p>
          <p className="text-xs text-muted-foreground">Right now</p>
        </div>
      </div>

      {/* Usability status */}
      <div className="flex items-center justify-between rounded-lg border px-3 py-2">
        <span className="text-sm text-muted-foreground">Room status</span>
        <Badge className={classroom.is_usable
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}>
          {classroom.is_usable ? "Usable" : "Unusable"}
        </Badge>
      </div>

      {/* Utilities summary */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Equipment</p>
        {Object.keys(utilityGroups).length === 0 ? (
          <p className="text-xs text-muted-foreground">No utilities recorded yet.</p>
        ) : (
          <div className="space-y-1.5">
            {Object.entries(utilityGroups).map(([type, { total, broken }]) => (
              <div key={type} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">{UTILITY_LABELS[type] ?? type}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span>{total}x</span>
                  {broken > 0 && (
                    <span className="text-red-500 font-medium">{broken} broken</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance summary */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Open Issues
          {openIssues.length > 0 && (
            <span className="ml-1.5 rounded-full bg-red-500 text-white text-[9px] px-1.5 py-0.5">{openIssues.length}</span>
          )}
        </p>
        {openIssues.length === 0 ? (
          <p className="text-xs text-muted-foreground">No open maintenance issues.</p>
        ) : (
          <div className="space-y-1.5">
            {openIssues.slice(0, 3).map((rec) => {
              const cfg = STATUS_CONFIG[rec.status];
              const Icon = cfg.Icon;
              return (
                <div key={rec.id} className="flex items-center gap-2.5 rounded-md border px-3 py-2">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-xs truncate">{rec.title}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.color}`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
