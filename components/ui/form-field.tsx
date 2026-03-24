import { forwardRef } from "react";
import { FieldError } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps extends React.ComponentProps<"input"> {
  label: string;
  error?: FieldError;
  description?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, description, id, className, ...props }, ref) => {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1.5">
        <Label htmlFor={fieldId}>{label}</Label>
        <Input
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          className={cn(className)}
          {...props}
        />
        {description && !error && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {error && <p className="text-xs text-destructive">{error.message}</p>}
      </div>
    );
  }
);
FormField.displayName = "FormField";
