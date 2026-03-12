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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { classService, attendanceService, studentService } from "@/lib/data";
import { Class, Student } from "@/types";
import {
  Loader2,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassOverview {
  class_id: string;
  class_name: string;
  teacher_name: string;
  total_students: number;
  average_attendance: number;
  excellent_students: number;
  good_students: number;
  poor_students: number;
  critical_students: number;
}

interface WeeklyClassData {
  student_id: string;
  student_name: string;
  admission_no: string;
  total_sessions: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_rate: number;
  status: string;
}

interface StudentOverview {
  student_id: string;
  student_name: string;
  admission_no: string;
  total_classes: number;
  total_sessions: number;
  total_present: number;
  total_absent: number;
  total_late: number;
  overall_attendance: number;
  status: string;
}

export function AttendanceInsights() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  const [classOverview, setClassOverview] = useState<ClassOverview | null>(
    null,
  );
  const [weeklyData, setWeeklyData] = useState<WeeklyClassData[] | null>(null);
  const [studentOverview, setStudentOverview] =
    useState<StudentOverview | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
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

  // Search students
  const searchStudents = useCallback(async (query: string) => {
    if (query.length < 2) {
      setFilteredStudents([]);
      return;
    }

    setSearchLoading(true);
    try {
      const searchResult = await studentService.search(query);
      setFilteredStudents(searchResult.results.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      setFilteredStudents([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchStudents(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchStudents]);

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
  }, [selectedClassId, dateRange]);

  // Load weekly class data - using week_start parameter (required by backend)
  const loadWeeklyClassData = useCallback(async () => {
    if (!selectedClassId) return;
    setLoading(true);
    setError(null);
    setWeeklyData(null);

    try {
      // Ensure we have a valid date
      const weekStart = dateRange.from;
      if (!weekStart) {
        throw new Error("Week start date is required");
      }

      const data = await attendanceService.getWeeklyForClass(
        selectedClassId,
        weekStart,
      );

      if (data === null || data === undefined) {
        setWeeklyData([]);
        setError(
          "No attendance data found for this class and week. The class may not have sessions scheduled during this period.",
        );
      } else if (Array.isArray(data)) {
        if (data.length === 0) {
          setError(
            "No students found or no attendance data available for the selected week.",
          );
        }
        setWeeklyData(data);
      } else {
        setWeeklyData([]);
        setError("Received unexpected data format from server.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("week_start parameter is required")) {
        setError("Invalid date format. Please select a valid week start date.");
      } else if (
        errorMessage.includes("Not Found") ||
        errorMessage.includes("404")
      ) {
        setError(
          "Endpoint not found. Please check if the attendance API is available.",
        );
      } else if (errorMessage.includes("Invalid class ID")) {
        setError("Invalid class selected. Please try a different class.");
      } else {
        setError(`API Error: ${errorMessage}`);
      }
      setWeeklyData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, dateRange.from]);

  // Load student overview data
  const loadStudentOverview = useCallback(async () => {
    if (!selectedStudent) return;
    setLoading(true);
    setError(null);
    try {
      const overview = await attendanceService.getStudentOverall(
        selectedStudent.id,
        dateRange.from,
        dateRange.to,
      );
      setStudentOverview(overview);
    } catch {
      setError("Failed to load student overview");
      setStudentOverview(null);
    } finally {
      setLoading(false);
    }
  }, [selectedStudent, dateRange]);

  // Auto-load data when dependencies change
  useEffect(() => {
    loadClassOverview();
  }, [loadClassOverview]);

  const getAttendanceStatusBadge = (rate: number, status: string) => {
    if (rate >= 90) {
      return (
        <Badge className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          Excellent
        </Badge>
      );
    } else if (rate >= 75) {
      return (
        <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">
          <TrendingUp className="h-3 w-3 mr-1" />
          Good
        </Badge>
      );
    } else if (rate >= 50) {
      return (
        <Badge className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700">
          <Clock className="h-3 w-3 mr-1" />
          Needs Improvement
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Critical
        </Badge>
      );
    }
  };

  const getProgressBarColor = (rate: number) => {
    if (rate >= 90) return "bg-green-500";
    if (rate >= 75) return "bg-blue-500";
    if (rate >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Date Range Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-2 items-center">
          <Calendar className="h-4 w-4 text-muted-foreground" />
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
        </div>
      </div>

      <Tabs defaultValue="class-overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="class-overview">Class Overview</TabsTrigger>
          <TabsTrigger value="student-details">Student Details</TabsTrigger>
          <TabsTrigger value="student-overview">Individual Student</TabsTrigger>
        </TabsList>

        {/* Class Overview Tab */}
        <TabsContent value="class-overview" className="space-y-4">
          <div className="flex gap-3">
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
            <Button
              onClick={loadClassOverview}
              disabled={loading || !selectedClassId}
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>

          {classOverview && (
            <>
              {/* Class Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center bg-card">
                  <CardContent className="pt-4 pb-3">
                    <p className="text-2xl font-bold text-foreground">
                      {classOverview.total_students}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total Students
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-center bg-card">
                  <CardContent className="pt-4 pb-3">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Math.round(classOverview.average_attendance)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Avg Attendance
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-center bg-card">
                  <CardContent className="pt-4 pb-3">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {classOverview.excellent_students}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Excellent (&ge;90%)
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-center bg-card">
                  <CardContent className="pt-4 pb-3">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {classOverview.critical_students}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Critical (&lt;50%)
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Distribution</CardTitle>
                  <CardDescription>
                    Student attendance performance breakdown for{" "}
                    {classOverview.class_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">
                        {classOverview.excellent_students}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Excellent (90%+)
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">
                        {classOverview.good_students}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Good (75-89%)
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Clock className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-amber-600">
                        {classOverview.poor_students}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Poor (50-74%)
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-red-600">
                        {classOverview.critical_students}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Critical (&lt;50%)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!loading && error && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-destructive text-center">{error}</p>
              </CardContent>
            </Card>
          )}

          {loading && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </TabsContent>

        {/* Student Details Tab */}
        <TabsContent value="student-details" className="space-y-4">
          <div className="flex gap-3">
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
            <Button
              onClick={() => {
                if (!selectedClassId) {
                  return;
                }
                if (!dateRange.from) {
                  setError("Please select a valid week start date");
                  return;
                }
                loadWeeklyClassData();
              }}
              disabled={loading || !selectedClassId || !dateRange.from}
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Load Details"
              )}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Student Attendance Details
              </CardTitle>
              <CardDescription>
                Individual student performance in selected class for the week
                starting {dateRange.from}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : weeklyData &&
                Array.isArray(weeklyData) &&
                weeklyData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Admission No</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Late</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weeklyData
                      .sort((a, b) => b.attendance_rate - a.attendance_rate)
                      .map((student) => (
                        <TableRow key={student.student_id}>
                          <TableCell className="font-medium">
                            {student.student_name}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {student.admission_no}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {student.total_sessions}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                            >
                              {student.present_count}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                            >
                              {student.absent_count}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                            >
                              {student.late_count}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full transition-all",
                                    getProgressBarColor(
                                      student.attendance_rate,
                                    ),
                                  )}
                                  style={{
                                    width: `${student.attendance_rate}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs font-medium w-12 text-right">
                                {Math.round(student.attendance_rate)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getAttendanceStatusBadge(
                              student.attendance_rate,
                              student.status,
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : error ? (
                <div className="text-center py-10 space-y-2">
                  <AlertTriangle className="h-8 w-8 mx-auto text-destructive" />
                  <p className="text-sm text-destructive font-medium">
                    {error}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <p>
                      Make sure the class has sessions scheduled for this week
                    </p>
                    <p>and students are enrolled in the selected class.</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {!selectedClassId
                      ? "Select a class to view student attendance data."
                      : weeklyData === null
                        ? 'Click "Load Details" to view student attendance data.'
                        : "No students found for the selected class and week."}
                  </p>
                  {selectedClassId && weeklyData !== null && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Try selecting a different week or check if students are
                      enrolled in this class.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Student Overview Tab */}
        <TabsContent value="student-overview" className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStudent(null);
                    setStudentOverview(null);
                  }}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              {/* Search Results Dropdown */}
              {searchQuery && filteredStudents.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="px-3 py-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        setSelectedStudent(student);
                        setSearchQuery(student.fullname);
                        setFilteredStudents([]);
                      }}
                    >
                      <p className="font-medium text-sm">{student.fullname}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.admission_no}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedStudent && (
              <Button
                onClick={loadStudentOverview}
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Load Overview"
                )}
              </Button>
            )}
          </div>

          {/* Selected Student Info */}
          {selectedStudent && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-primary">
                      {selectedStudent.fullname?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {selectedStudent.fullname}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.admission_no}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Student Overview Data */}
          {studentOverview && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center bg-card">
                <CardContent className="pt-4 pb-3">
                  <p className="text-2xl font-bold text-foreground">
                    {studentOverview.total_classes}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Classes Enrolled
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center bg-card">
                <CardContent className="pt-4 pb-3">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {studentOverview.total_sessions}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Sessions
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center bg-card">
                <CardContent className="pt-4 pb-3">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {studentOverview.total_present}
                  </p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </CardContent>
              </Card>
              <Card className="text-center bg-card">
                <CardContent className="pt-4 pb-3">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.round(studentOverview.overall_attendance)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Overall Rate</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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

          {/* Empty States */}
          {!loading && !error && !selectedStudent && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Search for a student to view their attendance overview
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !error && selectedStudent && !studentOverview && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  Click "Load Overview" to view attendance data for{" "}
                  {selectedStudent.fullname}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Loading Indicator for Search */}
          {searchLoading && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10 p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </div>
            </div>
          )}

          {/* No Results Message */}
          {searchQuery.length >= 2 &&
            !searchLoading &&
            filteredStudents.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10 p-3">
                <div className="text-sm text-muted-foreground text-center">
                  No students found for "{searchQuery}"
                </div>
              </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
