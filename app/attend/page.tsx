"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { scanAttendance } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  MapPin,
  Loader2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

type Step = "entry" | "locating" | "success" | "error";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

function AttendPage() {
  const params = useSearchParams();
  const sessionId = params.get("session") ?? "";
  const className = params.get("class") ?? "Session";
  const sessionDate = params.get("date") ?? "";
  const qrToken = params.get("token") ?? "";

  const [step, setStep] = useState<Step>("entry");
  const [admissionNo, setAdmissionNo] = useState("");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Attempt to get location in background on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => {
        // Location denied — proceed anyway, will flag in simulation
      },
      { timeout: 10000 }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (admissionNo.trim().length < 4) {
      setErrorMsg("Please enter your admission number (minimum 4 characters).");
      return;
    }

    setStep("locating");
    setErrorMsg("");

    // If we don't have location yet, try once more
    if (!location) {
      await new Promise<void>((resolve) => {
        if (!navigator.geolocation) {
          resolve();
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            });
            resolve();
          },
          () => resolve(),
          { timeout: 6000 }
        );
      });
    }

    try {
      await scanAttendance({
        admission_no: admissionNo.trim(),
        session_id: sessionId,
        qr_token: qrToken || undefined,
        latitude: location?.latitude,
        longitude: location?.longitude,
        accuracy: location?.accuracy,
      });
      setStep("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStep("error");
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="font-medium">Invalid QR Code</p>
            <p className="text-sm text-muted-foreground mt-1">
              This QR code is missing session information. Please ask your
              instructor to regenerate it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center mb-3">
            <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-xl font-bold">ICBT</h1>
          <p className="text-sm text-muted-foreground">
            Attendance Check-In
          </p>
        </div>

        {/* Session info */}
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{decodeURIComponent(className)}</p>
                {sessionDate && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(sessionDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
              <Badge
                variant="outline"
                className="text-green-600 border-green-300 bg-green-50 shrink-0"
              >
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main card */}
        <Card>
          <CardHeader className="pb-3">
            {step === "entry" && (
              <>
                <CardTitle className="text-base">Enter Your Admission Number</CardTitle>
                <CardDescription>
                  Type your student admission number to mark yourself present.
                </CardDescription>
              </>
            )}
            {step === "locating" && (
              <>
                <CardTitle className="text-base">Verifying…</CardTitle>
                <CardDescription>
                  Confirming your location and recording attendance.
                </CardDescription>
              </>
            )}
            {step === "success" && (
              <>
                <CardTitle className="text-base text-green-600">
                  Attendance Marked!
                </CardTitle>
                <CardDescription>
                  You have been marked present for this session.
                </CardDescription>
              </>
            )}
            {step === "error" && (
              <>
                <CardTitle className="text-base text-destructive">
                  Something went wrong
                </CardTitle>
                <CardDescription>{errorMsg}</CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent>
            {step === "entry" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admissionNo">Admission Number</Label>
                  <Input
                    id="admissionNo"
                    type="text"
                    inputMode="text"
                    placeholder="e.g. 2024001"
                    value={admissionNo}
                    onChange={(e) => setAdmissionNo(e.target.value)}
                    autoFocus
                    autoComplete="off"
                  />
                  {errorMsg && (
                    <p className="text-xs text-destructive">{errorMsg}</p>
                  )}
                </div>

                {/* Location status */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {location
                    ? `Location detected (±${Math.round(location.accuracy)}m)`
                    : "Waiting for location…"}
                </div>

                <Button type="submit" className="w-full">
                  Mark Attendance
                </Button>
              </form>
            )}

            {step === "locating" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Recording your attendance…
                </p>
              </div>
            )}

            {step === "success" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <div className="text-center space-y-1">
                  <p className="font-medium">
                    {admissionNo.trim()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Marked PRESENT
                  </p>
                  {location && (
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {location.latitude.toFixed(5)},{" "}
                      {location.longitude.toFixed(5)}
                    </p>
                  )}
                  {!location && (
                    <p className="text-xs text-amber-600">
                      Location not captured
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          ICBT · Attendance System
        </p>
      </div>
    </div>
  );
}

export default function AttendPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AttendPage />
    </Suspense>
  );
}
