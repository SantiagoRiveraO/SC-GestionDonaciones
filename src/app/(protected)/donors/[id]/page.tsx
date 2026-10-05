import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CirclePlus, Pencil } from "lucide-react";
import { DonationsTable } from "@/components/donations-table";
import { RecordPagination } from "@/components/record-pagination";
import { Alert } from "@/components/ui/alert";
import { DonationTotals } from "@/components/donation-totals";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { parseDonorFilters } from "@/lib/donors/filters";
import { DONOR_PAGE_SIZE, donorHistory, getDonor } from "@/lib/donors/queries";
import { donorMoneyLabels } from "@/lib/donors/presentation";
import { formatDate, formatDateTime } from "@/lib/format";

const contactLink = "inline-flex min-h-[48px] items-center break-all font-medium text-brand underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

export default async function DonorPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const query = await searchParams;
  const { page } = parseDonorFilters(query);
  const donor = await getDonor(id);
  if (!donor?.id) notFound();
  const history = await donorHistory(id, page);
  const pageCount = Math.ceil(history.total / DONOR_PAGE_SIZE);
  if (page > 1 && page > pageCount) redirect(`/donors/${id}${pageCount > 1 ? `?pagina=${pageCount}` : ""}`);
  const count = donor.donation_count ?? 0;
  const money = donorMoneyLabels(donor.money_totals);
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader title={donor.full_name ?? "Donante"} backHref="/donors" backLabel="Donantes" />
      {query.estado === "creado" || query.estado === "actualizado" ? <Alert variant="success">{query.estado === "creado" ? "Donante registrado." : "Cambios guardados."}</Alert> : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={`/donations/new?donante=${id}`} aria-label="Registrar donación de este donante" icon={<CirclePlus aria-hidden className="size-5" />}>Registrar donación</ButtonLink>
        <ButtonLink href={`/donors/${id}/edit`} variant="secondary" icon={<Pencil aria-hidden className="size-5" />}>Editar datos</ButtonLink>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-4 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-ink">Datos de contacto</h2>
          <dl className="space-y-3">
            <div><dt className="font-medium text-ink-soft">Teléfono</dt><dd>{donor.phone ? <a href={`tel:${donor.phone.replace(/[^\d+]/g, "")}`} className={contactLink}>{donor.phone}</a> : "No registrado"}</dd></div>
            <div><dt className="font-medium text-ink-soft">Correo electrónico</dt><dd>{donor.email ? <a href={`mailto:${donor.email}`} className={contactLink}>{donor.email}</a> : "No registrado"}</dd></div>
          </dl>
          {donor.notes ? <div className="space-y-1 border-t border-zinc-300 pt-4"><h3 className="font-bold text-ink">Notas</h3><p className="break-words whitespace-pre-line text-ink">{donor.notes}</p></div> : null}
        </Card>
        <div className="space-y-3"><DonationTotals title="Aportes registrados" total={count} moneyCount={donor.money_count ?? 0} suppliesCount={donor.supplies_count ?? 0} moneyLabels={money} />{donor.last_donation_date ? <p className="text-ink-soft">Última donación: {formatDate(donor.last_donation_date)}</p> : null}</div>
      </div>
      <section className="space-y-4" aria-labelledby="donor-history-title">
        <h2 id="donor-history-title" className="text-xl font-bold text-ink">Historial de donaciones</h2>
        {history.rows.length ? <DonationsTable rows={history.rows} total={history.total} /> : (
          <Card className="space-y-3 p-5"><p className="text-ink">Este donante todavía no tiene donaciones registradas.</p><Link href={`/donations/new?donante=${id}`} className={contactLink}>Registrar su primera donación →</Link></Card>
        )}
        <RecordPagination page={page} pageCount={pageCount} href={(next) => `/donors/${id}${next > 1 ? `?pagina=${next}` : ""}`} />
      </section>
      {donor.created_at ? <p className="text-ink-soft">Donante registrado el {formatDateTime(donor.created_at)}.</p> : null}
    </main>
  );
}
