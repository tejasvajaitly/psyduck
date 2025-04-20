import { cn } from "@/lib/utils";
import type React from "react";

type MetricStatus = "good" | "warning" | "danger" | "neutral";

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: MetricStatus;
  title?: string;
  description?: string;
  value?: string | number;
  trend?: number;
}

export function MetricCard({
  status = "neutral",
  title,
  description,
  value,
  trend,
  className,
  children,
  ...props
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border p-4 shadow-[0_1px_6px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.05)] md:col-span-2",
        status === "good" && "border-green-200 bg-green-50 text-green-900",
        status === "warning" && "border-amber-200 bg-amber-50 text-amber-900",
        status === "danger" && "border-red-200 bg-red-50 text-red-900",
        status === "neutral" && "border-gray-200 bg-gray-50 text-gray-900",
        className
      )}
      {...props}
    >
      {title && <div className="mb-1 font-medium text-lg">{title}</div>}
      {value && <div className="mb-1 font-medium">{value}</div>}
      {description && (
        <div
          className={cn(
            "text-sm",
            status === "good" && "text-green-800",
            status === "warning" && "text-amber-800",
            status === "danger" && "text-red-800",
            status === "neutral" && "text-gray-700"
          )}
        >
          {description}
        </div>
      )}
      {children}
    </div>
  );
}
