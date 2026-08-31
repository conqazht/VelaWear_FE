import * as React from "react";
import { cn } from "@/lib/utils";

export type AdminStatusVariant =
  | "success"
  | "active"
  | "live"
  | "warning"
  | "upcoming"
  | "danger"
  | "info"
  | "neutral"
  | "draft"
  | "flash"
  | "standard"
  | "admin"
  | "staff"
  | "user"
  | "method-get"
  | "method-post"
  | "method-put"
  | "method-patch"
  | "method-delete";

export interface AdminStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: AdminStatusVariant;
  dot?: boolean;
  icon?: React.ReactNode;
  size?: "sm" | "default";
}

const variantStyles: Record<AdminStatusVariant, { badge: string; dot: string }> = {
  success: {
    badge:
      "bg-emerald-50 text-emerald-800 border-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
    dot: "bg-emerald-500",
  },
  active: {
    badge:
      "bg-emerald-50 text-emerald-800 border-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
    dot: "bg-emerald-500",
  },
  live: {
    badge:
      "bg-emerald-500/10 text-emerald-700 border-emerald-500/25 font-semibold dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
    dot: "bg-emerald-500 animate-pulse",
  },
  warning: {
    badge:
      "bg-amber-50 text-amber-800 border-amber-200/90 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
    dot: "bg-amber-500",
  },
  upcoming: {
    badge:
      "bg-amber-50 text-amber-800 border-amber-200/90 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
    dot: "bg-amber-500",
  },
  danger: {
    badge:
      "bg-rose-50 text-rose-800 border-rose-200/90 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
    dot: "bg-rose-500",
  },
  info: {
    badge:
      "bg-blue-50 text-blue-800 border-blue-200/90 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
    dot: "bg-blue-500",
  },
  neutral: {
    badge:
      "bg-zinc-100/90 text-zinc-700 border-zinc-200/90 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700/60",
    dot: "bg-zinc-400",
  },
  draft: {
    badge:
      "bg-zinc-100/90 text-zinc-700 border-zinc-200/90 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700/60",
    dot: "bg-zinc-400",
  },
  flash: {
    badge:
      "bg-purple-50 text-purple-700 border-purple-200/90 font-medium dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
    dot: "bg-purple-500",
  },
  standard: {
    badge:
      "bg-[#f7f3ee] text-[#735639] border-[#e8ded2] font-medium dark:bg-[#2c2620] dark:text-[#d4c3b3] dark:border-[#423930]",
    dot: "bg-[#735639]",
  },
  admin: {
    badge:
      "bg-indigo-50 text-indigo-800 border-indigo-200/90 font-semibold dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60",
    dot: "bg-indigo-500",
  },
  staff: {
    badge:
      "bg-sky-50 text-sky-800 border-sky-200/90 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60",
    dot: "bg-sky-500",
  },
  user: {
    badge:
      "bg-slate-100 text-slate-700 border-slate-200/90 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/60",
    dot: "bg-slate-400",
  },
  "method-get": {
    badge:
      "bg-blue-50 text-blue-700 border-blue-200 font-mono font-semibold dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  "method-post": {
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200 font-mono font-semibold dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  "method-put": {
    badge:
      "bg-amber-50 text-amber-700 border-amber-200 font-mono font-semibold dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  "method-patch": {
    badge:
      "bg-orange-50 text-orange-700 border-orange-200 font-mono font-semibold dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
    dot: "bg-orange-500",
  },
  "method-delete": {
    badge:
      "bg-rose-50 text-rose-700 border-rose-200 font-mono font-semibold dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
    dot: "bg-rose-500",
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
  const styles = variantStyles[variant] ?? variantStyles.neutral;

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

/**
 * Utility helper to resolve resource status (ACTIVE / INACTIVE / DRAFT / ARCHIVED)
 */
export function getStatusBadgeVariant(status: string): AdminStatusVariant {
  const upper = status.toUpperCase();
  if (upper === "ACTIVE" || upper === "PUBLISHED" || upper === "COMPLETED" || upper === "PAID") {
    return "active";
  }
  if (upper === "DRAFT" || upper === "INACTIVE" || upper === "ARCHIVED") {
    return "draft";
  }
  if (upper === "PENDING" || upper === "UPCOMING" || upper === "LOW_STOCK") {
    return "upcoming";
  }
  if (upper === "CANCELLED" || upper === "OUT_OF_STOCK" || upper === "EXPIRED") {
    return "danger";
  }
  return "neutral";
}

/**
 * Utility helper to resolve HTTP method badge variant
 */
export function getHttpMethodVariant(method: string): AdminStatusVariant {
  const upper = method.toUpperCase();
  switch (upper) {
    case "GET":
      return "method-get";
    case "POST":
      return "method-post";
    case "PUT":
      return "method-put";
    case "PATCH":
      return "method-patch";
    case "DELETE":
      return "method-delete";
    default:
      return "neutral";
  }
}

/**
 * Utility helper to resolve Role badge variant
 */
export function getRoleBadgeVariant(roleName: string): AdminStatusVariant {
  const upper = roleName.toUpperCase();
  if (upper.includes("ADMIN")) {
    return "admin";
  }
  if (upper.includes("STAFF") || upper.includes("MANAGER")) {
    return "staff";
  }
  return "user";
}
