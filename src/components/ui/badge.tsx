import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

const toneClasses = {
  neutral: "border-border bg-muted text-muted-foreground",
  success: "border-emerald-500/25 bg-emerald-500/12 text-emerald-500",
  warning: "border-amber-500/25 bg-amber-500/12 text-amber-500",
  danger: "border-red-500/25 bg-red-500/12 text-red-500",
  info: "border-cyan-500/25 bg-cyan-500/12 text-cyan-500",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: keyof typeof toneClasses;
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
