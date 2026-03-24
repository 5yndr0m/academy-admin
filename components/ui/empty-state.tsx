import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
      {Icon && <Icon className="h-10 w-10 opacity-20" />}
      {title && <p className="text-sm font-medium text-foreground">{title}</p>}
      {description && <p className="text-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
