import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-destructive">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <p className="flex-1 text-sm">{message}</p>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="text-destructive hover:text-destructive">
          Retry
        </Button>
      )}
    </div>
  );
}
