import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "icon";
};

export function Button({ className, variant = "secondary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border text-sm font-semibold transition",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-2)]",
        variant === "primary" &&
          "border-transparent bg-[var(--accent-2)] text-white shadow-sm shadow-orange-900/10 hover:bg-[var(--accent-blue)]",
        variant === "secondary" &&
          "surface text-[var(--foreground)] hover:border-[var(--accent-blue)]/40 hover:bg-[var(--accent-blue)]/5",
        variant === "ghost" &&
          "border-transparent bg-transparent hover:bg-[var(--accent-soft)] hover:text-[var(--accent-blue)]",
        variant === "outline" &&
          "border-[var(--border)] bg-white/80 hover:border-[var(--accent-blue)]/50 hover:bg-[var(--accent-soft)] dark:bg-white/[0.03]",
        variant === "danger" && "border-transparent bg-red-600 text-white hover:bg-red-700",
        size === "sm" && "h-8 px-3",
        size === "md" && "h-10 px-4",
        size === "icon" && "h-9 w-9 p-0",
        className,
      )}
      {...props}
    />
  );
}
