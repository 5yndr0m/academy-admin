"use client";

import { useEffect, useState, useCallback } from "react";
import { conflictService } from "@/lib/data";
import type { ConflictRecord } from "@/types";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, EyeOff } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const typeBadge: Record<string, string> = {
  DOUBLE_BOOKING: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300",
  TEACHER_OVERLAP: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
  ROOM_CONFLICT: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300",
};

const severityBadge: Record<string, string> = {
  HIGH: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300",
  MEDIUM: "bg-amber-100 text-amber-800 border-amber-200",
  LOW: "bg-blue-100 text-blue-800 border-blue-200",
};

const statusBadge: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  RESOLVED: "bg-green-100 text-green-800 border-green-200",
  IGNORED: "bg-gray-100 text-gray-600 border-gray-200",
};

export function ConflictsTab() {
  const [conflicts, setConflicts] = useState<ConflictRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "RESOLVED" | "IGNORED" | "ALL">("PENDING");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await conflictService.getAll(
        statusFilter !== "ALL" ? { status: statusFilter } : undefined,
      );
      setConflicts(result.conflicts);
    } catch {
      setError("Failed to load conflicts");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleResolve = async (id: string) => {
    setActionLoading(id + "-resolve");
    try {
      await conflictService.resolve(id);
      await load();
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  const handleIgnore = async (id: string) => {
    setActionLoading(id + "-ignore");
    try {
      await conflictService.ignore(id);
      await load();
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Scheduling conflicts detected by the system
        </p>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="IGNORED">Ignored</SelectItem>
            <SelectItem value="ALL">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive text-center py-4">{error}</p>
      ) : conflicts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No {statusFilter !== "ALL" ? statusFilter.toLowerCase() : ""} conflicts found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Severity</TableHead>
                <TableHead className="text-xs">Session A</TableHead>
                <TableHead className="text-xs">Session B</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conflicts.map((c) => (
                <TableRow key={c.id} className="text-xs">
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeBadge[c.type] ?? ""}`}>
                      {c.type.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${severityBadge[c.severity] ?? ""}`}>
                      {c.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.session_a_class && (
                      <div>
                        <span className="font-medium text-foreground">{c.session_a_class}</span>
                        <br />
                        {c.session_a_date} · {c.session_a_time}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.session_b_class ? (
                      <div>
                        <span className="font-medium text-foreground">{c.session_b_class}</span>
                        <br />
                        {c.session_b_date} · {c.session_b_time}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {c.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusBadge[c.status] ?? ""}`}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {c.status === "PENDING" && (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Mark as resolved"
                          disabled={!!actionLoading}
                          onClick={() => handleResolve(c.id)}
                        >
                          {actionLoading === c.id + "-resolve" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Ignore this conflict"
                          disabled={!!actionLoading}
                          onClick={() => handleIgnore(c.id)}
                        >
                          {actionLoading === c.id + "-ignore" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    )}
                    {c.status !== "PENDING" && (
                      <span className="text-xs text-muted-foreground">
                        {c.resolved_by_name ?? "—"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
