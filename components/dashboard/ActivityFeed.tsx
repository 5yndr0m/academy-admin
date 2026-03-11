"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuditLog } from "@/types";
import {
  Clock,
  User,
  Activity,
  Shield,
  BookOpen,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  logs: AuditLog[];
}

// Derive a colour + icon from entity_type since we no longer have a 'category' field
function getStyle(entityType: string) {
  const t = entityType?.toUpperCase() ?? "";
  if (t.includes("INVOICE") || t.includes("EXPENSE")) {
    return {
      color: "bg-green-100 text-green-700",
      icon: <DollarSign className="h-3 w-3" />,
    };
  }
  if (t.includes("ATTENDANCE") || t.includes("SESSION")) {
    return {
      color: "bg-amber-100 text-amber-700",
      icon: <BookOpen className="h-3 w-3" />,
    };
  }
  if (t.includes("USER") || t.includes("TEACHER") || t.includes("STUDENT")) {
    return {
      color: "bg-blue-100 text-blue-700",
      icon: <User className="h-3 w-3" />,
    };
  }
  return {
    color: "bg-muted text-muted-foreground",
    icon: <Shield className="h-3 w-3" />,
  };
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActivityFeed({ logs }: ActivityFeedProps) {
  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Live audit log of system operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            No recent activity.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>Last {logs.length} system operations.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-0 text-sm">
          {logs.map((log, i) => {
            const { color, icon } = getStyle(log.entity_type);
            return (
              <div
                key={log.id}
                className={cn(
                  "flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors border-b last:border-0",
                  i === 0 && "bg-primary/5",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0",
                    color,
                  )}
                >
                  {icon}
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <p className="font-medium leading-none truncate">
                    {log.action}
                  </p>
                  {log.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {log.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono uppercase bg-muted px-1 rounded truncate max-w-[80px]">
                      <User className="h-2.5 w-2.5 shrink-0" />
                      {log.performed_by}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Clock className="h-2.5 w-2.5" />
                      {formatTime(log.created_at)}
                    </span>
                  </div>
                </div>

                {i === 0 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-4 px-1 animate-pulse shrink-0"
                  >
                    New
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
