import * as React from "react";
import { cn } from "@/lib/utils";

export type AdminStatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

export interface AdminStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: AdminStatusVariant;
  dot?: boolean;
  icon?: React.ReactNode;
  size?: "sm" | "default";
}

const variantStyles: Record<AdminStatusVariant, { badge: string; dot: string }> = {
  success: {
    badge:
      "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
    dot: "bg-emerald-500",
  },
  warning: {
    badge:
      "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
    dot: "bg-amber-500",
  },
  danger: {
    badge:
      "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
    dot: "bg-rose-500",
  },
  info: {
    badge:
      "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
    dot: "bg-blue-500",
  },
  neutral: {
    badge:
      "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800",
    dot: "bg-slate-400",
  },
};

export function AdminStatusBadge({
  variant = "neutral",
  dot = false,
  icon,
  size = "default",
  className,
  children,
  ...props
}: AdminStatusBadgeProps) {
  const styles = variantStyles[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border font-medium tracking-tight whitespace-nowrap select-none",
        size === "sm" ? "h-5 rounded-full px-2 text-[11px]" : "h-6 rounded-full px-2.5 text-xs",
        styles.badge,
        className,
      )}
      {...props}
    >
      {dot && (
        <span className={cn("size-1.5 shrink-0 rounded-full", styles.dot)} aria-hidden="true" />
      )}
      {icon && <span className="shrink-0 [&>svg]:size-3">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
