import { CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

const variants = {
  success: {
    role: "status" as const,
    icon: CircleCheck,
    className: "border-green-700 bg-green-50 text-green-900",
  },
  error: {
    role: "alert" as const,
    icon: TriangleAlert,
    className: "border-red-700 bg-red-50 text-red-900",
  },
  info: {
    role: "status" as const,
    icon: Info,
    className: "border-brand bg-brand-soft text-ink",
  },
};

export function Alert({
  variant,
  children,
}: {
  variant: "success" | "error" | "info";
  children: ReactNode;
}) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      role={config.role}
      className={`flex items-start gap-3 rounded-[12px] border p-4 text-lg ${config.className}`}
    >
      <Icon aria-hidden className="mt-0.5 size-6 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
