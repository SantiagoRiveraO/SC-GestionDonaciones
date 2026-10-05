import { CirclePlus, HandHeart, Search } from "lucide-react";
import type { ReactNode } from "react";
import { DonationFilters } from "@/components/donation-filters";
import { DonationsPagination } from "@/components/donations-pagination";
import { DonationsTable } from "@/components/donations-table";
import { DonationTotals } from "@/components/donation-totals";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  hasActiveSearchFilters,
  type DonationSearchFilters,
} from "@/lib/donations/filters";
import type {
  DonationFilterOptions,
  DonationListResult,
} from "@/lib/donations/queries";
import { donationSummaryLabels } from "@/lib/donations/presentation";
import type { DonationSummaryRow } from "@/types/database";
import type { SupplyCategoryOption } from "@/lib/donations/categories";

type DonationsListProps = {
  filters: DonationSearchFilters;
  list: DonationListResult;
  options: DonationFilterOptions;
  summary: DonationSummaryRow[];
  categories: SupplyCategoryOption[];
};

function EmptyState({
  icon,
  children,
  action,
}: {
  icon: ReactNode;
  children: string;
  action: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-4 px-5 py-10 text-center">
      {icon}
      <p className="text-lg text-ink">{children}</p>
      {action}
    </Card>
  );
}

export function DonationsList({
  filters,
  list,
  options,
  summary,
  categories,
}: DonationsListProps) {
  const filtersActive = hasActiveSearchFilters(filters);
  const outOfRange = list.total > 0 && list.rows.length === 0;
  const moneyRows = summary.filter((row) => row.kind === "money");
  const moneyCount = moneyRows.reduce((sum, row) => sum + row.donation_count, 0);
  const suppliesCount = summary.filter((row) => row.kind === "supplies").reduce((sum, row) => sum + row.donation_count, 0);

  return (
    <div className="space-y-4">
      <DonationFilters
        filters={filters}
        currencies={options.currencies}
        methods={options.methods}
        categories={categories}
      />

      {list.total > 0 && <DonationTotals title={filtersActive ? "Resultados" : "Totales"} total={list.total} moneyCount={moneyCount} suppliesCount={suppliesCount} moneyLabels={donationSummaryLabels(moneyRows)} filtered={filtersActive} />}

      {list.total === 0 && !filtersActive ? (
        <EmptyState
          icon={<HandHeart aria-hidden className="size-12 text-accent" />}
          action={
            <ButtonLink
              href="/donations/new"
              icon={<CirclePlus aria-hidden className="size-5" />}
            >
              Registrar una donación
            </ButtonLink>
          }
        >
          Todavía no hay donaciones. ¡Registra la primera!
        </EmptyState>
      ) : list.total === 0 ? (
        <EmptyState
          icon={<Search aria-hidden className="size-12 text-accent" />}
          action={
            <ButtonLink href="/donations" variant="secondary">
              Limpiar filtros
            </ButtonLink>
          }
        >
          No encontramos donaciones con esos filtros.
        </EmptyState>
      ) : outOfRange ? (
        <>
          <EmptyState
            icon={<Search aria-hidden className="size-12 text-accent" />}
            action={
              <ButtonLink href="/donations" variant="secondary">
                Limpiar filtros
              </ButtonLink>
            }
          >
            No encontramos donaciones con esos filtros.
          </EmptyState>
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
