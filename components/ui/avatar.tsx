import { cn } from "@/lib/utils";

export function Avatar({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--accent-blue)] text-xs font-black text-white ring-2 ring-[var(--accent)]/15",
        className,
      )}
    >
      {label}
    </span>
  );
}
