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
        variant === "primary" && "border-transparent bg-[var(--accent)] text-white hover:brightness-95",
        variant === "secondary" && "surface text-[var(--foreground)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
        variant === "ghost" && "border-transparent bg-transparent hover:bg-black/[0.05] dark:hover:bg-white/[0.08]",
        variant === "outline" && "border-[var(--border)] bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
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
