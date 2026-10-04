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
    q: parsed.q,
    currency: parsed.currency,
    method: parsed.method,
    from: parsed.from,
    to: parsed.to,
  };

  const [list, summary, options] = await Promise.all([
    listDonations(filters, parsed.page),
    getDonationSummary(filters),
    getFilterOptions(),
  ]);

  if (list.pageCount > 0 && parsed.page > list.pageCount) {
    redirect(donationsListHref({ ...filters, page: list.pageCount }));
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="Donaciones"
        description="Todas las donaciones registradas."
        actions={
          <ButtonLink
            href="/donations/new"
            icon={<CirclePlus aria-hidden className="size-5" />}
          >
            Registrar donación
          </ButtonLink>
        }
      />

      <StatusMessage estado={params.estado} />

      <DonationsList
        filters={filters}
        list={list}
        options={options}
        summary={summary}
      />
    </main>
  );
}
