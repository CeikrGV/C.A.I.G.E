import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm transition-all duration-200",
            "placeholder:text-slate-400",
            "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-11",
            error && "border-danger focus:border-danger focus:ring-danger/10",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-danger font-medium">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
