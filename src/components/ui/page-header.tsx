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
  compactActions = false,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  compactActions?: boolean;
}) {
  if (compactActions) return <header className="space-y-2">
    <div className="flex items-center justify-between gap-3"><h1 className="min-w-0 break-words text-[25px] leading-tight font-bold text-ink min-[360px]:text-[28px]">{title}</h1><div className="shrink-0">{actions}</div></div>
    {description && <p className="text-ink-soft">{description}</p>}
  </header>;
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
