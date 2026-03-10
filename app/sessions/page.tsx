"use client";

import { useState, useEffect } from "react";
import { SessionManager } from "@/components/sessions/SessionManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sessionService, dashboardService } from "@/lib/data";
import { ClassSession } from "@/types";
import {
  Clock,
  Calendar,
  Play,
  Square,
  AlertTriangle,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function SessionsPage() {
  const [todaySessions, setTodaySessions] = useState<ClassSession[]>([]);
  const [activeSessions, setActiveSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadSessions = async () => {
    try {
      setRefreshing(true);
      const [todayData, activeData] = await Promise.all([
        sessionService.getToday(),
        sessionService.getActive(),
      ]);
      setTodaySessions(todayData);
      setActiveSessions(activeData);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleStartSession = async (sessionId: string) => {
    setActionLoading(sessionId);
    try {
      await sessionService.start(sessionId);
      await loadSessions();
    } catch (error) {
      console.error("Failed to start session:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    setActionLoading(sessionId);
    try {
      await sessionService.end(sessionId);
      await loadSessions();
    } catch (error) {
      console.error("Failed to end session:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateWeeklySessions = async () => {
    setActionLoading("generate");
    try {
      const today = new Date();
      const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      await sessionService.generate({
        start_date: today.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      });

      await loadSessions();
    } catch (error) {
      console.error("Failed to generate sessions:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return (
          <Badge
            variant="outline"
            className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950"
          >
            <Clock className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      case "ACTIVE":
        return (
          <Badge
            variant="outline"
            className="text-green-600 dark:text-green-400 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950"
          >
            <Play className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Session Management
          </h2>
          <p className="text-muted-foreground">
            Create, manage, and control class sessions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadSessions}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleGenerateWeeklySessions}
            disabled={actionLoading === "generate"}
          >
            {actionLoading === "generate" ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Calendar className="h-4 w-4 mr-2" />
            )}
            Generate Week Sessions
          </Button>
        </div>
      </div>

      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manage">Manage Sessions</TabsTrigger>
          <TabsTrigger value="today">Today's Sessions</TabsTrigger>
          <TabsTrigger value="active">Active Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <SessionManager onSessionChange={loadSessions} />
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Sessions ({todaySessions.length})
              </CardTitle>
              <CardDescription>
                All sessions scheduled for today with their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todaySessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto opacity-20 dark:opacity-10 mb-3" />
                  <p className="text-sm">No sessions scheduled for today</p>
                  <p className="text-xs">
                    Create manual sessions or generate from schedules
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-sm font-mono font-medium">
                            {session.start_time}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {session.end_time}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium">{session.class?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {session.classroom?.name} •{" "}
                            {session.class?.teacher?.full_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(session.status || "SCHEDULED")}
                        <div className="flex gap-1">
                          {session.status === "SCHEDULED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartSession(session.id)}
                              disabled={actionLoading === session.id}
                            >
                              {actionLoading === session.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          {session.status === "ACTIVE" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEndSession(session.id)}
                              disabled={actionLoading === session.id}
                            >
                              {actionLoading === session.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-green-600" />
                Active Sessions ({activeSessions.length})
              </CardTitle>
              <CardDescription>Sessions currently in progress</CardDescription>
            </CardHeader>
            <CardContent>
              {activeSessions.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No sessions are currently active. Start a scheduled session
                    to begin tracking attendance.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {activeSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-3 w-3 bg-green-500 dark:bg-green-400 rounded-full animate-pulse" />
                        <div className="text-center">
                          <div className="text-sm font-mono font-medium">
                            {session.start_time} - {session.end_time}
                          </div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Active
                          </Badge>
                        </div>
                        <div>
                          <h3 className="font-medium">{session.class?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {session.classroom?.name} •{" "}
                            {session.class?.teacher?.full_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => (window.location.href = "/attendance")}
                        >
                          Mark Attendance
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEndSession(session.id)}
                          disabled={actionLoading === session.id}
                        >
                          {actionLoading === session.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                          End Session
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
