import { redirect } from "next/navigation";
import { UserPlus, Users } from "lucide-react";
import { DonorFiltersControl } from "@/components/donor-filters";
import { DonorList } from "@/components/donor-list";
import { RecordPagination } from "@/components/record-pagination";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getFilterOptions } from "@/lib/donations/queries";
import { donorsHref, parseDonorFilters } from "@/lib/donors/filters";
import { DONOR_PAGE_SIZE, listDonors } from "@/lib/donors/queries";

export default async function DonorsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseDonorFilters(await searchParams);
  const [list, options] = await Promise.all([listDonors(filters), getFilterOptions()]);
  const pageCount = Math.ceil(list.total / DONOR_PAGE_SIZE);
  if (filters.page > 1 && filters.page > pageCount) redirect(donorsHref({ ...filters, page: Math.max(1, pageCount) }));
  const currencies = [...new Set(["USD", "VES", "EUR", ...options.currencies, filters.currency])];
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader title="Donantes" compactActions description="Contactos e historial de sus aportes." actions={<ButtonLink href="/donors/new" aria-label="Registrar donante" className="px-3" icon={<UserPlus aria-hidden className="hidden size-5 sm:block" />}><span className="sm:hidden">Registrar</span><span className="hidden sm:inline">Registrar donante</span></ButtonLink>} />
      <DonorFiltersControl key={filters.q} filters={filters} currencies={currencies} />
      <p className="text-xl font-bold text-ink" aria-live="polite">{list.total} {list.total === 1 ? "donante" : "donantes"}{filters.q ? (list.total === 1 ? " encontrado" : " encontrados") : (list.total === 1 ? " registrado" : " registrados")}</p>
      {list.rows.length ? <DonorList rows={list.rows} filters={filters} /> : (
        <Card className="flex flex-col items-center gap-4 px-5 py-10 text-center">
          <Users aria-hidden className="size-12 text-accent" />
          <p className="text-lg text-ink">{filters.q ? "No encontramos donantes con esa búsqueda." : "Todavía no hay donantes. Registra el primero."}</p>
          <ButtonLink href={filters.q ? "/donors" : "/donors/new"} variant="secondary">{filters.q ? "Ver todos los donantes" : "Registrar donante"}</ButtonLink>
        </Card>
      )}
      <RecordPagination page={filters.page} pageCount={pageCount} href={(page) => donorsHref({ ...filters, page })} />
    </main>
  );
}
