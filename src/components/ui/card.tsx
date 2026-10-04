import type { ComponentProps } from "react";

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`rounded-[12px] border border-zinc-200 bg-surface shadow-[0_2px_8px_rgba(24,24,27,0.08)] ${className}`}
      {...props}
    />
  );
}
