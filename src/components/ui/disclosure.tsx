import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export function Disclosure({ title, open = false, children }: { title: string; open?: boolean; children: ReactNode }) {
  return <details open={open} className="group rounded-xl border border-zinc-300 bg-surface">
    <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 font-medium text-brand focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand [&::-webkit-details-marker]:hidden">
      {title}<ChevronDown aria-hidden className="size-5 shrink-0 group-open:rotate-180" />
    </summary>
    <div className="space-y-4 border-t border-zinc-200 p-4">{children}</div>
  </details>;
}
