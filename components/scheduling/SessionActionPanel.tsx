"use client";

import { useState } from "react";
import type { ClassSession } from "@/types";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Clock, Calendar, ArrowRightLeft, TimerReset } from "lucide-react";
import { schedulingService } from "@/lib/data";
import type { CollisionResult } from "@/types";

interface SessionActionPanelProps {
  session: ClassSession | null;
  onClose: () => void;
  onUpdated: () => void;
}

type ActionType = "delay" | "reschedule" | "extend" | "room_change" | null;

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800 border-blue-200",
  ACTIVE: "bg-green-100 text-green-800 border-green-200",
  COMPLETED: "bg-gray-100 text-gray-600 border-gray-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export function SessionActionPanel({ session, onClose, onUpdated }: SessionActionPanelProps) {
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collision, setCollision] = useState<CollisionResult | null>(null);

  // Delay form
  const [delayMinutes, setDelayMinutes] = useState("15");
  const [delayReason, setDelayReason] = useState("");

  // Reschedule form
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  // Extend form
  const [extendMinutes, setExtendMinutes] = useState("15");
  const [extendReason, setExtendReason] = useState("");

  const resetForms = () => {
    setDelayMinutes("15");
    setDelayReason("");
    setNewDate("");
    setNewStartTime("");
    setNewEndTime("");
    setRescheduleReason("");
    setExtendMinutes("15");
    setExtendReason("");
    setError(null);
    setCollision(null);
  };

  const closeAction = () => {
    setActiveAction(null);
    resetForms();
  };

  if (!session) return null;

  const canMutate = session.status !== "COMPLETED" && session.status !== "CANCELLED";

  const handleDelay = async () => {
    const mins = parseInt(delayMinutes);
    if (!mins || mins <= 0) {
      setError("Enter a valid number of minutes");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await schedulingService.delaySession(session.id, {
        minutes: mins,
        reason: delayReason || undefined,
      });
      closeAction();
      onUpdated();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to delay session";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!newDate || !newStartTime || !newEndTime) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await schedulingService.rescheduleSession(session.id, {
        new_date: newDate,
        new_start_time: newStartTime,
        new_end_time: newEndTime,
        reason: rescheduleReason || undefined,
      });
      closeAction();
      onUpdated();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to reschedule";
      if (msg.includes("conflict")) {
        setCollision({ has_conflict: true, conflicts: [] });
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async () => {
    const mins = parseInt(extendMinutes);
    if (!mins || mins <= 0) {
      setError("Enter a valid number of minutes");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await schedulingService.extendSession(session.id, {
        extra_minutes: mins,
        reason: extendReason || undefined,
      });
      closeAction();
      onUpdated();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to extend session";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const sessionDate = new Date(session.session_date).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <Sheet open={!!session} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-[400px] sm:w-[480px] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-base">Session Details</SheetTitle>
          </SheetHeader>

          {/* Session summary */}
          <div className="space-y-3 pb-6 border-b">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm">
                  {(session as ClassSession & { class?: { name?: string } }).class?.name ?? "Class"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{sessionDate}</p>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[session.status] ?? ""}`}
              >
                {session.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Time</span>
                <p className="font-medium">{session.start_time} – {session.end_time}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Room</span>
                <p className="font-medium">
                  {(session as ClassSession & { classroom?: { name?: string } }).classroom?.name ?? "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {canMutate ? (
            <div className="pt-6 space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-3">Session Actions</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => { setActiveAction("delay"); resetForms(); }}
              >
                <Clock className="h-4 w-4" /> Delay session
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => { setActiveAction("reschedule"); resetForms(); }}
              >
                <Calendar className="h-4 w-4" /> Reschedule to another date
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => { setActiveAction("extend"); resetForms(); }}
              >
                <TimerReset className="h-4 w-4" /> Extend session
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => { setActiveAction("room_change"); resetForms(); }}
              >
                <ArrowRightLeft className="h-4 w-4" /> Change room
              </Button>
            </div>
          ) : (
            <p className="pt-6 text-sm text-muted-foreground text-center">
              No actions available for a {session.status.toLowerCase()} session.
            </p>
          )}
        </SheetContent>
      </Sheet>

      {/* Delay dialog */}
      <Dialog open={activeAction === "delay"} onOpenChange={(o) => !o && closeAction()}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Delay Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-2">
              {["15", "30", "45"].map((m) => (
                <Button
                  key={m}
                  variant={delayMinutes === m ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setDelayMinutes(m)}
                >
                  {m} min
                </Button>
              ))}
            </div>
            <div className="space-y-1">
              <Label htmlFor="delay-min" className="text-xs">Custom minutes</Label>
              <Input
                id="delay-min"
                type="number"
                min={1}
                max={480}
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="delay-reason" className="text-xs">Reason (optional)</Label>
              <Textarea
                id="delay-reason"
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                rows={2}
                placeholder="e.g. Teacher running late"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAction}>Cancel</Button>
            <Button onClick={handleDelay} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Apply Delay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule dialog */}
      <Dialog open={activeAction === "reschedule"} onOpenChange={(o) => !o && closeAction()}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="r-date" className="text-xs">New Date</Label>
              <Input
                id="r-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="r-start" className="text-xs">Start Time</Label>
                <Input
                  id="r-start"
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="r-end" className="text-xs">End Time</Label>
                <Input
                  id="r-end"
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="r-reason" className="text-xs">Reason (optional)</Label>
              <Textarea
                id="r-reason"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                rows={2}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAction}>Cancel</Button>
            <Button onClick={handleReschedule} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend dialog */}
      <Dialog open={activeAction === "extend"} onOpenChange={(o) => !o && closeAction()}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Extend Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-2">
              {["15", "30", "45"].map((m) => (
                <Button
                  key={m}
                  variant={extendMinutes === m ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setExtendMinutes(m)}
                >
                  +{m} min
                </Button>
              ))}
            </div>
            <div className="space-y-1">
              <Label htmlFor="ext-min" className="text-xs">Custom minutes</Label>
              <Input
                id="ext-min"
                type="number"
                min={1}
                max={480}
                value={extendMinutes}
                onChange={(e) => setExtendMinutes(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ext-reason" className="text-xs">Reason (optional)</Label>
              <Textarea
                id="ext-reason"
                value={extendReason}
                onChange={(e) => setExtendReason(e.target.value)}
                rows={2}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAction}>Cancel</Button>
            <Button onClick={handleExtend} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Extend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Collision blocker — shown for unhandled conflict state */}
      {collision?.has_conflict && activeAction === null && (
        <Dialog open onOpenChange={() => setCollision(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Scheduling Conflict</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground py-2">
              The requested change conflicts with one or more existing sessions.
              Review the conflicts tab or choose a different time/room.
            </p>
            <DialogFooter>
              <Button onClick={() => setCollision(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
