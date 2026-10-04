import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

const focusRing =
  "rounded-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

export function PageHeader({
  title,
  description,
  backHref,
  backLabel,
  actions,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 space-y-2">
        {backHref && backLabel ? (
          <Link
            href={backHref}
            className={`inline-flex min-h-[48px] items-center gap-2 font-medium text-brand ${focusRing}`}
          >
            <ArrowLeft aria-hidden className="size-5" />
            Volver a {backLabel}
          </Link>
        ) : null}
        <h1 className="break-words text-[30px] leading-tight font-bold text-ink">{title}</h1>
        {description ? <p className="text-ink-soft">{description}</p> : null}
      </div>
      {actions ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
