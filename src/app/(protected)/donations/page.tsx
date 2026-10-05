import { CirclePlus } from "lucide-react";
import { redirect } from "next/navigation";
import { DonationsList } from "@/components/donations-list";
import { StatusMessage } from "@/components/status-message";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  donationsListHref,
  parseDonationFilters,
} from "@/lib/donations/filters";
import {
  getDonationSummary,
  getFilterOptions,
  listDonations,
  listSupplyCategories,
} from "@/lib/donations/queries";

type DonationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DonationsPage({
  searchParams,
}: DonationsPageProps) {
  const params = await searchParams;
  const parsed = parseDonationFilters(params);
  const filters = {
    category: parsed.category,
    kind: parsed.kind,
    q: parsed.q,
    currency: parsed.currency,
    method: parsed.method,
    from: parsed.from,
    to: parsed.to,
  };

  const [list, summary, options, categories] = await Promise.all([
    listDonations(filters, parsed.page),
    getDonationSummary(filters),
    getFilterOptions(),
    listSupplyCategories(),
  ]);

  if (list.pageCount > 0 && parsed.page > list.pageCount) {
    redirect(donationsListHref({ ...filters, page: list.pageCount }));
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="Donaciones"
        compactActions
        description="Dinero e insumos recibidos por la fundación."
        actions={
          <ButtonLink
            href="/donations/new"
            aria-label="Registrar donación"
            className="px-3"
            icon={<CirclePlus aria-hidden className="hidden size-5 sm:block" />}
          >
            <span className="sm:hidden">Registrar</span><span className="hidden sm:inline">Registrar donación</span>
          </ButtonLink>
        }
      />

      <StatusMessage estado={params.estado} />

      <DonationsList
        filters={filters}
        list={list}
        options={options}
        summary={summary}
        categories={categories}
      />
    </main>
  );
}
