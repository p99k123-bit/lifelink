import * as React from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonSize = "sm" | "md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-rose-600 text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-400",
  secondary:
    "bg-sky-100 text-sky-900 shadow-sm transition hover:bg-sky-200 focus-visible:ring-2 focus-visible:ring-sky-300",
  ghost:
    "bg-white/70 text-slate-700 ring-1 ring-slate-200 transition hover:bg-white",
  danger:
    "bg-red-600 text-white shadow-md shadow-red-200 transition hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-400",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
};

export function Button({ className, variant = "primary", size = "md", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
