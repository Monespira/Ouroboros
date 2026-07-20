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
        tone === "blue" && "border-[var(--accent-blue)]/25 bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]",
        tone === "green" && "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300",
        tone === "orange" && "border-[var(--accent-2)]/25 bg-[var(--accent-2)]/10 text-[var(--accent-2)]",
        tone === "red" && "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
        tone === "violet" && "border-[var(--accent)]/25 bg-[var(--accent)]/10 text-[var(--accent)] dark:text-violet-200",
        className,
      )}
      {...props}
    />
  );
}
