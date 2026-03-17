"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, Loader2, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { emailService } from "@/lib/data";
import type { EmailLogResponse } from "@/lib/data";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SENT: "default",
  DELIVERED: "default",
  FAILED: "destructive",
  PENDING: "secondary",
};

const TYPE_LABELS: Record<string, string> = {
  payment_receipt: "Payment Receipt",
  class_cancellation: "Class Cancellation",
  custom_message: "Custom",
  bulk_announcement: "Bulk",
  system_test: "Test",
  monthly_summary: "Monthly Summary",
  enrollment_confirmation: "Enrollment",
  class_schedule_change: "Schedule Change",
};

function StatusBadge({ status }: { status: string }) {
  const icon = status === "SENT" || status === "DELIVERED"
    ? <CheckCircle2 className="h-3 w-3" />
    : status === "FAILED"
      ? <XCircle className="h-3 w-3" />
      : <Clock className="h-3 w-3" />;
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? "outline"} className="gap-1 text-xs">
      {icon} {status}
    </Badge>
  );
}

export function EmailLogsTable() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<EmailLogResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [filterEmail, setFilterEmail] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await emailService.getLogs({
        recipient_email: filterEmail || undefined,
        email_type: filterType !== "all" ? filterType : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        from_date: filterFrom || undefined,
        to_date: filterTo || undefined,
        page,
        limit: LIMIT,
      });
      setLogs(res.data);
      setTotal(res.total_count);
    } catch {
      toast({ title: "Error", description: "Failed to load email logs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [filterEmail, filterType, filterStatus, filterFrom, filterTo, page, toast]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <Label>Search email</Label>
              <Input
                placeholder="guardian@email.com"
                value={filterEmail}
                onChange={(e) => { setFilterEmail(e.target.value); setPage(1); }}
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={filterType} onValueChange={(v) => { setFilterType(v); setPage(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>From date</Label>
              <Input type="date" value={filterFrom} onChange={(e) => { setFilterFrom(e.target.value); setPage(1); }} />
            </div>
            <div>
              <Label>To date</Label>
              <Input type="date" value={filterTo} onChange={(e) => { setFilterTo(e.target.value); setPage(1); }} />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{total} total records</p>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent at</TableHead>
                  <TableHead>Sent by</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                )}
                {!loading && logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                      No email logs found
                    </TableCell>
                  </TableRow>
                )}
                {!loading && logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      <p className="font-medium">{log.recipient_email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{log.recipient_type.replace("_", " ")}</p>
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px]">
                      <p className="truncate">{log.subject}</p>
                      {log.error_message && (
                        <p className="text-xs text-red-500 truncate">{log.error_message}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {TYPE_LABELS[log.email_type] ?? log.email_type}
                      </Badge>
                    </TableCell>
                    <TableCell><StatusBadge status={log.status} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.sent_at
                        ? format(new Date(log.sent_at), "dd MMM yyyy HH:mm")
                        : format(new Date(log.created_at), "dd MMM yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{log.sent_by_name || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
              <span className="text-muted-foreground">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
