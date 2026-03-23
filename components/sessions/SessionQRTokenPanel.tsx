"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  QrCode,
  RefreshCw,
  XCircle,
  Clock,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { ClassSession, SessionQRToken } from "@/types";
import { sessionQRService } from "@/lib/data";

interface Props {
  session: ClassSession | null;
  open: boolean;
  onClose: () => void;
}

const DEFAULT_TTL = 5; // minutes

export function SessionQRTokenPanel({ session, open, onClose }: Props) {
  const [token, setToken] = useState<SessionQRToken | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_TTL * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startCountdown = useCallback((expiresAt: string) => {
    clearTimer();
    const update = () => {
      const left = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
      );
      setSecondsLeft(left);
      if (left === 0) clearTimer();
    };
    update();
    timerRef.current = setInterval(update, 1000);
  }, []);

  const generateToken = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError("");
    try {
      const t = await sessionQRService.generate(session.id, DEFAULT_TTL);
      setToken(t);
      setTotalSeconds(DEFAULT_TTL * 60);
      startCountdown(t.expires_at);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate QR token");
    } finally {
      setLoading(false);
    }
  }, [session, startCountdown]);

  const revokeToken = async () => {
    if (!session) return;
    setLoading(true);
    try {
      await sessionQRService.revoke(session.id);
      setToken(null);
      clearTimer();
      setSecondsLeft(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to revoke token");
    } finally {
      setLoading(false);
    }
  };

  // On open — fetch any existing active token, or generate one automatically
  useEffect(() => {
    if (!open || !session) return;
    setError("");
    setToken(null);

    sessionQRService
      .get(session.id)
      .then((t) => {
        setToken(t);
        const total = Math.round(
          (new Date(t.expires_at).getTime() - Date.now() + 1000) / 1000,
        );
        setTotalSeconds(Math.max(total, DEFAULT_TTL * 60));
        startCountdown(t.expires_at);
      })
      .catch(() => {
        // No active token — auto-generate one
        generateToken();
      });

    return () => clearTimer();
  }, [open, session]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) return null;

  const progressPct = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  const isExpired = token !== null && secondsLeft === 0;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Live Session QR
          </DialogTitle>
          <DialogDescription>
            Project this QR on screen. Students scan it to self-check-in. The
            token rotates every {DEFAULT_TTL} minutes.
          </DialogDescription>
        </DialogHeader>

        {/* Session summary */}
        <div className="rounded-lg border p-3 text-sm space-y-0.5">
          <p className="font-semibold">{session.class?.name}</p>
          <p className="text-muted-foreground">
            {session.start_time} – {session.end_time} ·{" "}
            {session.classroom?.name ?? "—"}
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating token…</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <ShieldAlert className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button size="sm" onClick={generateToken}>
              Retry
            </Button>
          </div>
        )}

        {/* Active token */}
        {!loading && !error && token && (
          <div className="space-y-4">
            {/* Countdown */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {isExpired ? (
                    <span className="text-destructive font-medium">Expired</span>
                  ) : (
                    <span>
                      Expires in{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {mm}:{ss}
                      </span>
                    </span>
                  )}
                </span>
                <Badge
                  variant="outline"
                  className={
                    isExpired
                      ? "text-destructive border-destructive/40"
                      : "text-green-600 border-green-300 bg-green-50"
                  }
                >
                  {isExpired ? "Expired" : "Active"}
                </Badge>
              </div>
              <Progress
                value={progressPct}
                className={`h-1.5 ${isExpired ? "[&>div]:bg-destructive" : progressPct < 25 ? "[&>div]:bg-amber-500" : ""}`}
              />
            </div>

            {/* QR code */}
            {!isExpired && (
              <div className="flex justify-center p-4 bg-white rounded-lg border">
                <QRCodeSVG
                  value={token.attend_url}
                  size={220}
                  level="M"
                  includeMargin
                />
              </div>
            )}

            {isExpired && (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <ShieldAlert className="h-10 w-10 text-amber-500" />
                <p className="text-sm text-muted-foreground">
                  This QR token has expired. Generate a new one.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={generateToken}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Rotate QR
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-destructive hover:text-destructive"
                onClick={revokeToken}
                disabled={loading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Revoke
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
