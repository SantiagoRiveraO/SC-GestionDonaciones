import Link from "next/link";
import {
  donationsListHref,
  type DonationSearchFilters,
} from "@/lib/donations/filters";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

type DonationsPaginationProps = {
  page: number;
  pageCount: number;
  filters: DonationSearchFilters;
};

export function DonationsPagination({
  page,
  pageCount,
  filters,
}: DonationsPaginationProps) {
  const isOutOfRange = pageCount > 0 && page > pageCount;

  if (pageCount <= 1 && !isOutOfRange) {
    return null;
  }

  const previousHref = donationsListHref({
    ...filters,
    page: isOutOfRange ? pageCount : page - 1,
  });
  const nextHref = donationsListHref({ ...filters, page: page + 1 });
  const canGoPrevious = page > 1;
  const canGoNext = page < pageCount;

  return (
    <nav
      aria-label="Paginación"
      className="flex flex-wrap items-center justify-between gap-2"
    >
      {canGoPrevious ? (
        <Link
          href={previousHref}
          className={`rounded-sm text-sm font-medium text-zinc-900 hover:underline ${focusRing}`}
        >
          Anterior
        </Link>
      ) : (
        <span className="text-sm font-medium text-zinc-400">Anterior</span>
      )}
      <p className="text-sm text-zinc-600">
        Página {page} de {pageCount}
      </p>
      {canGoNext ? (
        <Link
          href={nextHref}
          className={`rounded-sm text-sm font-medium text-zinc-900 hover:underline ${focusRing}`}
        >
          Siguiente
        </Link>
      ) : (
        <span className="text-sm font-medium text-zinc-400">Siguiente</span>
      )}
    </nav>
  );
}
