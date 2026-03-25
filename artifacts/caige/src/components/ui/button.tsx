import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, ...props }, ref) => {
    
    const variants = {
      default: "bg-primary text-primary-foreground shadow-md hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5",
      outline: "border-2 border-primary text-primary hover:bg-primary/5 active:bg-primary/10",
      ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      destructive: "bg-danger text-danger-foreground hover:bg-red-600 shadow-md hover:shadow-lg",
      secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300 shadow-sm",
    };

    const sizes = {
      default: "h-11 px-6 py-2 rounded-xl",
      sm: "h-9 px-4 rounded-lg text-sm",
      lg: "h-14 px-8 rounded-2xl text-lg",
      icon: "h-11 w-11 rounded-xl flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 ease-out active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
