import Link from "next/link";
import { DeleteDonationButton } from "@/components/delete-donation-button";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import type { DonationListRow } from "@/types/database";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

type DonationDetailProps = {
  donation: DonationListRow;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-zinc-100 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-zinc-500">{label}</dt>
      <dd className="text-sm text-zinc-900">{value}</dd>
    </div>
  );
}

function attribution(name: string | null | undefined, iso: string | null | undefined) {
  const who = name?.trim() ? name : "un usuario eliminado";
  const when = iso ? formatDateTime(iso) : "—";
  return `por ${who} el ${when}`;
}

export function DonationDetail({ donation }: DonationDetailProps) {
  const amount =
    donation.amount == null || !donation.currency
      ? "—"
      : formatMoney(donation.amount, donation.currency);

  return (
    <div className="space-y-6">
      <dl className="rounded-lg border border-zinc-200 px-4">
        <DetailRow
          label="Fecha"
          value={donation.donated_at ? formatDate(donation.donated_at) : "—"}
        />
        <DetailRow label="Donante" value={donation.donor_name || "—"} />
        <DetailRow label="Monto" value={amount} />
        <DetailRow label="Método" value={donation.method || "—"} />
        <DetailRow label="Concepto" value={donation.concept || "—"} />
        <DetailRow label="Notas" value={donation.notes || "—"} />
        <DetailRow
          label="Registrada"
          value={attribution(donation.created_by_name, donation.created_at)}
        />
        <DetailRow
          label="Última edición"
          value={attribution(donation.updated_by_name, donation.updated_at)}
        />
      </dl>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {donation.id ? (
          <>
            <Link
              href={`/donations/${donation.id}/edit`}
              className={`inline-flex items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 ${focusRing}`}
            >
              Editar
            </Link>
            <DeleteDonationButton donationId={donation.id} />
          </>
        ) : null}
        <Link
          href="/donations"
          className={`inline-flex items-center justify-center rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 ${focusRing}`}
        >
          Volver
        </Link>
      </div>
    </div>
  );
}
