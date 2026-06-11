import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "blue" | "green" | "orange" | "red" | "violet";
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
        tone === "neutral" && "border-[var(--border)] bg-black/[0.03] text-[var(--muted)] dark:bg-white/[0.06]",
        tone === "blue" && "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300",
        tone === "green" && "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300",
        tone === "orange" && "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300",
        tone === "red" && "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
        tone === "violet" && "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
        className,
      )}
      {...props}
    />
  );
}
