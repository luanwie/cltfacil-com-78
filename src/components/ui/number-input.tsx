import * as React from "react";
import { cn } from "@/lib/utils";

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: number;
  onChange?: (value: number | undefined) => void;
  prefix?: string;
  suffix?: string;
  decimal?: boolean;
  min?: number;
  max?: number;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onChange, prefix, suffix, decimal = false, min, max, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(
      value !== undefined ? String(value) : ""
    );

    React.useEffect(() => {
      setDisplayValue(value !== undefined ? String(value) : "");
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      // Allow empty string
      if (newValue === "") {
        setDisplayValue("");
        onChange?.(undefined);
        return;
      }

      // Validate numeric input
      const regex = decimal ? /^\d*\.?\d*$/ : /^\d*$/;
      if (!regex.test(newValue)) return;

      const numericValue = decimal ? parseFloat(newValue) : parseInt(newValue);
      
      // Check min/max bounds
      if (min !== undefined && numericValue < min) return;
      if (max !== undefined && numericValue > max) return;

      setDisplayValue(newValue);
      onChange?.(isNaN(numericValue) ? undefined : numericValue);
    };

    return (
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {prefix}
          </span>
        )}
        <input
          type="text"
          className={cn(
            "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            prefix && "pl-8",
            suffix && "pr-12",
            className
          )}
          value={displayValue}
          onChange={handleChange}
          ref={ref}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {suffix}
          </span>
        )}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";

export { NumberInput };