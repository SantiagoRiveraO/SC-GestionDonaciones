import { CirclePlus, HandHeart, Search } from "lucide-react";
import type { ReactNode } from "react";
import { DonationFilters } from "@/components/donation-filters";
import { DonationsPagination } from "@/components/donations-pagination";
import { DonationsTable } from "@/components/donations-table";
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
  const countLabel =
    list.total === 1 ? "1 donación" : `${list.total} donaciones`;
  const totals = donationSummaryLabels(summary);

  return (
    <div className="space-y-4">
      <DonationFilters
        filters={filters}
        currencies={options.currencies}
        methods={options.methods}
        categories={categories}
      />

      <Card
        className="space-y-1 border-brand-soft bg-brand-soft px-4 py-3"
        aria-live="polite"
        data-testid="donations-summary"
      >
        <p className="text-xl leading-tight font-bold text-ink">
          {countLabel}
        </p>
        {totals.length > 0 ? (
          <p className="text-[16px] text-brand">{totals.join(" · ")}</p>
        ) : null}
      </Card>

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
