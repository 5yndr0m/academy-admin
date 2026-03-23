"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Loader2, User } from "lucide-react";
import { reportService } from "@/lib/data";
import { LecturerSummaryResponse } from "@/types";

function HoursBar({ pct }: { pct: number }) {
  const color =
    pct >= 85 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-indigo-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-xs tabular-nums w-10 text-right">{pct}%</span>
    </div>
  );
}

export function LecturerSummaryTab() {
  const [semesterId, setSemesterId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LecturerSummaryResponse | null>(null);
  const [error, setError] = useState("");

  const load = async (sid?: string) => {
    setLoading(true);
    setError("");
    try {
      const result = await reportService.getLecturerSummary(sid || undefined);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      {/* Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filter by Semester</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="space-y-1.5 flex-1 max-w-xs">
              <Label>Semester ID (optional)</Label>
              <Input
                placeholder="UUID — leave blank for all"
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
              />
            </div>
            <Button onClick={() => load(semesterId)} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && data && data.entries.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <User className="h-10 w-10 opacity-20" />
          <p className="text-sm">No lecturer data found</p>
        </div>
      )}

      {!loading && data && data.entries.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lecturer</TableHead>
                  <TableHead className="text-center">Subjects</TableHead>
                  <TableHead>Hours Progress</TableHead>
                  <TableHead className="text-right">Conducted</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-center">Reports</TableHead>
                  <TableHead className="text-center">Avg Effectiveness</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.entries.map((e) => (
                  <TableRow key={e.teacher_id}>
                    <TableCell className="font-medium">{e.teacher_name}</TableCell>
                    <TableCell className="text-center">{e.allocated_subjects}</TableCell>
                    <TableCell className="min-w-[140px]">
                      <HoursBar pct={e.hours_percent} />
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{e.total_conducted_hours}h</TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">{e.total_allocated_hours}h</TableCell>
                    <TableCell className="text-center">{e.report_count}</TableCell>
                    <TableCell className="text-center">
                      {e.avg_effectiveness > 0 ? (
                        <Badge
                          variant="outline"
                          className={
                            e.avg_effectiveness >= 70
                              ? "text-green-600 border-green-300 bg-green-50"
                              : e.avg_effectiveness >= 50
                                ? "text-amber-600 border-amber-300 bg-amber-50"
                                : "text-destructive border-destructive/30 bg-destructive/5"
                          }
                        >
                          {e.avg_effectiveness}%
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
