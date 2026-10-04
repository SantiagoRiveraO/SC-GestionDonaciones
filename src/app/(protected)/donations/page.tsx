import Link from "next/link";
import { redirect } from "next/navigation";
import { DonationsList } from "@/components/donations-list";
import {
  donationsListHref,
  parseDonationFilters,
} from "@/lib/donations/filters";
import {
  getDonationSummary,
  getFilterOptions,
  listDonations,
} from "@/lib/donations/queries";
import { formatSummaryLine } from "@/lib/format";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

type DonationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DonationsPage({
  searchParams,
}: DonationsPageProps) {
  const parsed = parseDonationFilters(await searchParams);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Donaciones</h1>
        </div>
        <Link
          href="/donations/new"
          className={`inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 sm:w-auto ${focusRing}`}
        >
          Nueva donación
        </Link>
      </div>

      <DonationsList
        filters={filters}
        list={list}
        options={options}
        summaryLine={formatSummaryLine(summary, list.total)}
      />
    </main>
  );
}
