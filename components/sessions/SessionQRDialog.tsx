"use client";

import { useRef } from "react";
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
import { Download, QrCode, Clock, MapPin } from "lucide-react";
import { ClassSession } from "@/types";

interface SessionQRDialogProps {
  session: ClassSession | null;
  open: boolean;
  onClose: () => void;
}

export function SessionQRDialog({
  session,
  open,
  onClose,
}: SessionQRDialogProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  if (!session) return null;

  const attendUrl = `${window.location.origin}/attend?session=${session.id}&class=${encodeURIComponent(session.class?.name ?? "")}&date=${session.session_date}`;

  const handleDownload = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement("canvas");
    const img = new Image();
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const link = document.createElement("a");
      link.download = `qr-${session.class?.name ?? session.id}-${session.session_date}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Session QR Code
          </DialogTitle>
          <DialogDescription>
            Students scan this QR code with their phone to mark attendance.
            Their location is recorded automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session info */}
          <div className="rounded-lg border p-3 space-y-1">
            <p className="font-semibold">{session.class?.name}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {session.start_time} – {session.end_time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {session.classroom?.name ?? "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className="text-green-600 border-green-300 bg-green-50 text-xs"
              >
                {session.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {session.session_date}
              </span>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center p-4 bg-white rounded-lg border">
            <QRCodeSVG
              ref={svgRef}
              value={attendUrl}
              size={220}
              level="M"
              includeMargin
            />
          </div>

          <p className="text-xs text-center text-muted-foreground break-all">
            {attendUrl}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button className="flex-1" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
