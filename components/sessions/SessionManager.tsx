"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  sessionService,
  classService,
  classroomService,
  dashboardService,
} from "@/lib/data";
import { Class, Classroom } from "@/types";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  X,
  AlertTriangle,
  CheckCircle,
  Loader2,
  MapPin,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionManagerProps {
  onSessionChange?: () => void;
}

interface TodayClass {
  id: string;
  start_time: string;
  end_time: string;
  class?: {
    id: string;
    name: string;
    teacher?: {
      full_name: string;
    };
  };
  classroom?: {
    id: string;
    name: string;
  };
  is_schedule?: boolean;
  status?: string;
}

export function SessionManager({ onSessionChange }: SessionManagerProps) {
  const [todaySessions, setTodaySessions] = useState<TodayClass[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create session dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    class_id: "",
    classroom_id: "",
    session_date: new Date(),
    start_time: "",
    end_time: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Cancellation state
  const [cancelling, setCancelling] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);

      // Get date range for next 7 days
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const startDate = today.toISOString().split("T")[0];
      const endDate = nextWeek.toISOString().split("T")[0];

      const [todayData, activeData, futureData, classesData, classroomsData] =
        await Promise.all([
          sessionService.getToday(),
          sessionService.getActive(),
          sessionService.getByDateRange(startDate, endDate),
          classService.getAll(),
          classroomService.getAll(),
        ]);

      // Combine all sessions, removing duplicates
      const allSessions = [...todayData, ...activeData, ...futureData].filter(
        (session, index, self) =>
          index === self.findIndex((s) => s.id === session.id),
      );

      setTodaySessions(allSessions || []);
      setClasses(classesData.filter((c) => c.status === "ACTIVE"));
      setClassrooms(classroomsData.filter((c) => c.is_usable));
    } catch (error) {
      console.error("Failed to load session data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateSession = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      await sessionService.create({
        class_id: createForm.class_id,
        classroom_id: createForm.classroom_id,
        session_date: format(createForm.session_date, "yyyy-MM-dd"),
        start_time: createForm.start_time,
        end_time: createForm.end_time,
      });

      setCreateDialogOpen(false);
      setCreateForm({
        class_id: "",
        classroom_id: "",
        session_date: new Date(),
        start_time: "",
        end_time: "",
      });
      await loadData();
      onSessionChange?.();
    } catch (error: unknown) {
      setCreateError(
        (error as any).response?.data?.error || "Failed to create session",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    setCancelling(sessionId);
    try {
      await sessionService.cancel(sessionId);
      await loadData();
      onSessionChange?.();
    } catch (error) {
      console.error("Failed to cancel session:", error);
    } finally {
      setCancelling(null);
    }
  };

  const isCreateFormValid = () => {
    return (
      createForm.class_id &&
      createForm.classroom_id &&
      createForm.start_time &&
      createForm.end_time &&
      createForm.start_time < createForm.end_time
    );
  };

  const resetCreateForm = () => {
    setCreateForm({
      class_id: "",
      classroom_id: "",
      session_date: new Date(),
      start_time: "",
      end_time: "",
    });
    setCreateError(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Filter sessions by status and time
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().slice(0, 5);

  const activeSessions = todaySessions.filter((s) => s.status === "ACTIVE");
  const scheduledSessions = todaySessions.filter(
    (s) => s.status === "SCHEDULED",
  );
  const completedSessions = todaySessions.filter(
    (s) => s.status === "COMPLETED",
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Session Management
            </CardTitle>
            <CardDescription>
              Manage today's sessions - create manual sessions and cancel
              scheduled ones
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
            <Dialog
              open={createDialogOpen}
              onOpenChange={(open) => {
                setCreateDialogOpen(open);
                if (!open) resetCreateForm();
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Session
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Manual Session</DialogTitle>
                  <DialogDescription>
                    Create a one-off session for a class that&apos;s not
                    normally scheduled for today.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="class-select">Class</Label>
                    <Select
                      value={createForm.class_id}
                      onValueChange={(value) =>
                        setCreateForm({ ...createForm, class_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              {c.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="classroom-select">Classroom</Label>
                    <Select
                      value={createForm.classroom_id}
                      onValueChange={(value) =>
                        setCreateForm({ ...createForm, classroom_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a classroom" />
                      </SelectTrigger>
                      <SelectContent>
                        {classrooms.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {c.name} (Capacity: {c.capacity})
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !createForm.session_date && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {createForm.session_date ? (
                            format(createForm.session_date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={createForm.session_date}
                          onSelect={(date) =>
                            date &&
                            setCreateForm({ ...createForm, session_date: date })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={createForm.start_time}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            start_time: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={createForm.end_time}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            end_time: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {createError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{createError}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateSession}
                    disabled={!isCreateFormValid() || creating}
                  >
                    {creating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Create Session
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Active Sessions */}
            {activeSessions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Active Sessions ({activeSessions.length})
                </h3>
                <div className="grid gap-3">
                  {activeSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-center gap-4">
                        <Badge
                          variant="outline"
                          className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700"
                        >
                          {session.start_time} - {session.end_time}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">
                            {session.class?.name || "Unknown Class"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.classroom?.name || "No room"} •{" "}
                            {session.class?.teacher?.full_name || "No teacher"}
                          </p>
                          <p className="text-xs text-green-600">
                            {today} • Active
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelSession(session.id)}
                        disabled={cancelling === session.id}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        {cancelling === session.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scheduled Sessions (Future) */}
            {scheduledSessions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Scheduled Sessions ({scheduledSessions.length})
                </h3>
                <div className="grid gap-3">
                  {scheduledSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                    >
                      <div className="flex items-center gap-4">
                        <Badge
                          variant="outline"
                          className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                        >
                          {session.start_time} - {session.end_time}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">
                            {session.class?.name || "Unknown Class"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.classroom?.name || "No room"} •{" "}
                            {session.class?.teacher?.full_name || "No teacher"}
                          </p>
                          <p className="text-xs text-blue-600">
                            {today} • Scheduled
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Scheduled
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelSession(session.id)}
                          disabled={cancelling === session.id}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          {cancelling === session.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Sessions */}
            {completedSessions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-gray-600" />
                  Completed Sessions ({completedSessions.length})
                </h3>
                <div className="grid gap-3">
                  {completedSessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800"
                    >
                      <div className="flex items-center gap-4">
                        <Badge
                          variant="outline"
                          className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                        >
                          {session.start_time} - {session.end_time}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">
                            {session.class?.name || "Unknown Class"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.classroom?.name || "No room"} •{" "}
                            {session.class?.teacher?.full_name || "No teacher"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {today} • Completed
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Completed
                      </Badge>
                    </div>
                  ))}
                  {completedSessions.length > 5 && (
                    <p className="text-xs text-center text-muted-foreground">
                      Showing recent 5 of {completedSessions.length} completed
                      sessions
                    </p>
                  )}
                </div>
              </div>
            )}

            {todaySessions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto opacity-20 dark:opacity-10 mb-3" />
                <p className="text-sm">No sessions found</p>
                <p className="text-xs">
                  Create a manual session or generate from schedules
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
