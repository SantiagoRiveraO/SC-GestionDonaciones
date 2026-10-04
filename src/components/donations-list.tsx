import { DonationFilters } from "@/components/donation-filters";
import { DonationsPagination } from "@/components/donations-pagination";
import { DonationsTable } from "@/components/donations-table";
import { hasActiveSearchFilters, type DonationSearchFilters } from "@/lib/donations/filters";
import type { DonationFilterOptions, DonationListResult } from "@/lib/donations/queries";

type DonationsListProps = {
  filters: DonationSearchFilters;
  list: DonationListResult;
  options: DonationFilterOptions;
  summaryLine: string;
};

function EmptyState({ children }: { children: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-600">
      {children}
    </div>
  );
}

export function DonationsList({
  filters,
  list,
  options,
  summaryLine,
}: DonationsListProps) {
  const filtersActive = hasActiveSearchFilters(filters);
  const outOfRange = list.total > 0 && list.rows.length === 0;

  return (
    <div className="space-y-4">
      <DonationFilters
        filters={filters}
        currencies={options.currencies}
        methods={options.methods}
        summaryLine={summaryLine}
      />

      {list.total === 0 && !filtersActive ? (
        <EmptyState>No hay donaciones registradas todavía.</EmptyState>
      ) : list.total === 0 ? (
        <EmptyState>No hay resultados para los filtros aplicados.</EmptyState>
      ) : outOfRange ? (
        <>
          <EmptyState>No hay resultados en esta página.</EmptyState>
          <DonationsPagination
            page={list.page}
            pageCount={list.pageCount}
            filters={filters}
          />
        </>
      ) : (
        <>
          <DonationsTable rows={list.rows} total={list.total} />
          <DonationsPagination
            page={list.page}
            pageCount={list.pageCount}
            filters={filters}
          />
        </>
      )}
    </div>
  );
}
