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
      const [dashboardData, classesData, classroomsData] = await Promise.all([
        dashboardService.get(),
        classService.getAll(),
        classroomService.getAll(),
      ]);

      setTodaySessions(dashboardData.today_sessions || []);
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

  const actualSessions = todaySessions.filter((s) => !s.is_schedule);
  const scheduledClasses = todaySessions.filter((s) => s.is_schedule);

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
            {actualSessions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Active Sessions ({actualSessions.length})
                </h3>
                <div className="grid gap-3">
                  {actualSessions.map((session) => (
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

            {/* Scheduled Classes (from recurring schedules) */}
            {scheduledClasses.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Scheduled Classes ({scheduledClasses.length})
                  <Badge variant="secondary" className="text-xs">
                    From recurring schedules
                  </Badge>
                </h3>
                <div className="grid gap-3">
                  {scheduledClasses.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                    >
                      <div className="flex items-center gap-4">
                        <Badge
                          variant="outline"
                          className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                        >
                          {schedule.start_time} - {schedule.end_time}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">
                            {schedule.class?.name || "Unknown Class"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {schedule.classroom?.name || "No room"} •{" "}
                            {schedule.class?.teacher?.full_name || "No teacher"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Not generated
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {todaySessions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto opacity-20 dark:opacity-10 mb-3" />
                <p className="text-sm">No sessions scheduled for today</p>
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
