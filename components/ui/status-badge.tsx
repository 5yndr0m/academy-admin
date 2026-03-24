import { Badge } from "@/components/ui/badge";

type StatusVariant =
  | "ACTIVE"
  | "INACTIVE"
  | "ENROLLED"
  | "DROPPED"
  | "COMPLETED"
  | "SCHEDULED"
  | "CANCELLED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "PAID"
  | "UNPAID"
  | "USABLE"
  | "UNUSABLE"
  | "AVAILABLE"
  | "OCCUPIED";

const STATUS_STYLES: Record<StatusVariant, string> = {
  ACTIVE: "text-green-700 border-green-300 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950",
  INACTIVE: "text-muted-foreground border-muted bg-muted/30",
  ENROLLED: "text-green-700 border-green-300 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950",
  DROPPED: "text-destructive border-destructive/30 bg-destructive/5",
  COMPLETED: "text-blue-700 border-blue-300 bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:bg-blue-950",
  SCHEDULED: "text-amber-700 border-amber-300 bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-950",
  CANCELLED: "text-destructive border-destructive/30 bg-destructive/5",
  PENDING: "text-amber-700 border-amber-300 bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-950",
  APPROVED: "text-green-700 border-green-300 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950",
  REJECTED: "text-destructive border-destructive/30 bg-destructive/5",
  PAID: "text-green-700 border-green-300 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950",
  UNPAID: "text-destructive border-destructive/30 bg-destructive/5",
  USABLE: "text-green-700 border-green-300 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950",
  UNUSABLE: "text-destructive border-destructive/30 bg-destructive/5",
  AVAILABLE: "text-green-700 border-green-300 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950",
  OCCUPIED: "text-amber-700 border-amber-300 bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-950",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status as StatusVariant] ?? "text-muted-foreground border-muted bg-muted/30";
  return (
    <Badge variant="outline" className={`text-xs ${styles} ${className ?? ""}`}>
      {status}
    </Badge>
  );
}
