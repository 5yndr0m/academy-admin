"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { ClassroomStatus } from "@/types";

interface ClassroomStatusGridProps {
  status?: ClassroomStatus[];
}

export function ClassroomStatusGrid({ status = [] }: ClassroomStatusGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Availability</CardTitle>
        <CardDescription>Current classroom occupancy status.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {status.map((room) => (
            <div
              key={room.id}
              className={cn(
                "p-3 rounded-lg border text-center flex flex-col items-center justify-center gap-2",
                !room.is_usable
                  ? "bg-muted/40 border-muted-foreground/20 opacity-60"
                  : room.is_occupied
                    ? "bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    : "bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
              )}
            >
              <div className="font-semibold text-sm">{room.name}</div>

              {!room.is_usable ? (
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 text-muted-foreground"
                >
                  Unusable
                </Badge>
              ) : room.is_occupied ? (
                <Badge variant="destructive" className="text-[10px] h-5">
                  In Use
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 bg-green-100 text-green-700"
                >
                  Free
                </Badge>
              )}

              <p className="text-[10px] text-muted-foreground">
                Cap: {room.capacity}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
