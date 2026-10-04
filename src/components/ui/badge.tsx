import type { ReactNode } from "react";

export function Badge({
  icon,
  children,
  className = "",
}: {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 font-medium text-brand ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
