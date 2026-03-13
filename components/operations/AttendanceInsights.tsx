"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { classService, attendanceService } from "@/lib/data";
import { Class } from "@/types";
import {
  Loader2,
  Users,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
} from "lucide-react";

interface ClassOverview {
  class_id: string;
  class_name: string;
  teacher_name?: string;
  total_students: number;
  average_attendance: number;
  excellent_students: number;
  good_students: number;
  poor_students: number;
  critical_students: number;
}

export function AttendanceInsights() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  const [classOverview, setClassOverview] = useState<ClassOverview | null>(
    null,
  );

  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load classes on mount
  useEffect(() => {
    classService
      .getAll()
      .then((classData) => {
        const activeClasses = classData.filter((c) => c.status === "ACTIVE");
        setClasses(activeClasses);
        if (activeClasses.length > 0) {
          setSelectedClassId(activeClasses[0].id);
        }
      })
      .catch(() => setError("Failed to load classes"))
      .finally(() => setLoadingClasses(false));
  }, []);

  // Load class overview data
  const loadClassOverview = useCallback(async () => {
    if (!selectedClassId) return;

    setLoading(true);
    setError(null);

    try {
      const overview = await attendanceService.getClassOverview(
        selectedClassId,
        dateRange.from,
        dateRange.to,
      );
      setClassOverview(overview);
    } catch {
      setError("Failed to load class overview");
      setClassOverview(null);
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, dateRange.from, dateRange.to]);

  // Auto-load when class or date range changes
  useEffect(() => {
    if (selectedClassId && !loadingClasses) {
      loadClassOverview();
    }
  }, [selectedClassId, loadingClasses, loadClassOverview]);

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 75) return "text-blue-600";
    if (rate >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getAttendanceBadge = (rate: number) => {
    if (rate >= 90) return "bg-green-100 text-green-700 border-green-200";
    if (rate >= 75) return "bg-blue-100 text-blue-700 border-blue-200";
    if (rate >= 50) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Attendance Insights
        </h2>
        <p className="text-muted-foreground">
          Comprehensive attendance overview and analytics
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex gap-2">
          <Select
            value={selectedClassId}
            onValueChange={setSelectedClassId}
            disabled={loadingClasses}
          >
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Select a class…" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Date Range:</span>
          <Input
            type="date"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, from: e.target.value }))
            }
            className="w-[140px]"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="date"
            value={dateRange.to}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, to: e.target.value }))
            }
            className="w-[140px]"
          />
          <Button
            onClick={loadClassOverview}
            disabled={loading || !selectedClassId}
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            Analyze
          </Button>
        </div>
      </div>

      {/* Class Overview Results */}
      {!loading && !error && classOverview && (
        <div className="space-y-6">
          {/* Main Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {classOverview.total_students}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Students
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-lg font-bold">
                    {classOverview.teacher_name || "Unknown Teacher"}
                  </p>
                  <p className="text-sm text-muted-foreground">Teacher</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp
                    className={`h-8 w-8 mx-auto mb-2 ${getAttendanceColor(classOverview.average_attendance)}`}
                  />
                  <p
                    className={`text-2xl font-bold ${getAttendanceColor(classOverview.average_attendance)}`}
                  >
                    {classOverview.average_attendance.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Avg Attendance
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                  <Badge
                    className={getAttendanceBadge(
                      classOverview.average_attendance,
                    )}
                  >
                    {classOverview.average_attendance >= 90
                      ? "Excellent"
                      : classOverview.average_attendance >= 75
                        ? "Good"
                        : classOverview.average_attendance >= 50
                          ? "Fair"
                          : "Needs Attention"}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Performance
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Performance Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Performance Distribution
              </CardTitle>
              <CardDescription>
                Breakdown of students by attendance performance in{" "}
                {classOverview.class_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {classOverview.excellent_students}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Excellent (90%+)
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {classOverview.good_students}
                  </p>
                  <p className="text-sm text-muted-foreground">Good (75-89%)</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                  <Clock className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {classOverview.poor_students}
                  </p>
                  <p className="text-sm text-muted-foreground">Fair (50-74%)</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {classOverview.critical_students}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Needs Attention (&lt;50%)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !classOverview && selectedClassId && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">
                Click "Analyze" to view attendance insights for the selected
                class
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
