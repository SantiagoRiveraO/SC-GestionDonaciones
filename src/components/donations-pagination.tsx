import {
  donationsListHref,
  type DonationSearchFilters,
} from "@/lib/donations/filters";
import { Button, ButtonLink } from "@/components/ui/button";

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
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      {canGoPrevious ? (
        <ButtonLink href={previousHref} variant="secondary">
          ← Anterior
        </ButtonLink>
      ) : (
        <Button type="button" variant="secondary" disabled>
          ← Anterior
        </Button>
      )}
      <p className="text-center font-medium text-ink">
        Página {page} de {pageCount}
      </p>
      {canGoNext ? (
        <ButtonLink href={nextHref} variant="secondary">
          Siguiente →
        </ButtonLink>
      ) : (
        <Button type="button" variant="secondary" disabled>
          Siguiente →
        </Button>
      )}
    </nav>
  );
}
