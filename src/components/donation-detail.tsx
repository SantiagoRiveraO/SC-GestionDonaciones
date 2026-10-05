import type { ReactNode } from "react";
import Link from "next/link";
import {
  Banknote,
  Gift,
  Pencil,
} from "lucide-react";
import { DeleteDonationButton } from "@/components/delete-donation-button";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Disclosure } from "@/components/ui/disclosure";
import {
  formatDate,
  formatDateTime,
  formatLongDate,
} from "@/lib/format";
import { donationValueLabel } from "@/lib/donations/presentation";
import type { DonationListRow } from "@/types/database";

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-zinc-100 py-3 last:border-0 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="font-medium text-ink-soft">{label}</dt>
      <dd className="min-w-0 break-words whitespace-pre-line text-ink">{children}</dd>
    </div>
  );
}

function who(name: string | null | undefined) {
  return name?.trim() ? name : "un usuario eliminado";
}

export function DonationDetail({ donation }: { donation: DonationListRow }) {
  const amount = donationValueLabel(donation);
  const supplies = donation.kind === "supplies";
  const dateLabel = donation.donated_at
    ? formatDate(donation.donated_at)
    : "—";
  const longDate = donation.donated_at
    ? formatLongDate(donation.donated_at)
    : "—";
  const created = donation.created_at
    ? formatDateTime(donation.created_at)
    : "—";
  const updated = donation.updated_at
    ? formatDateTime(donation.updated_at)
    : "—";

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-5">
        <Badge
          icon={supplies ? <Gift aria-hidden className="size-4" /> : <Banknote aria-hidden className="size-4" />}
        >
          {supplies ? "Donación de insumos" : "Donación de dinero"}
        </Badge>
        <p className="break-words text-[28px] leading-tight font-bold text-ink sm:text-[32px]">
          {supplies ? donation.item_description : amount}
        </p>
        <dl>
          {supplies ? (
            <>
              <DetailRow label="Categoría">{donation.category_name ?? "Sin categoría"}</DetailRow>
              <DetailRow label="Cantidad">{donation.quantity == null ? "No especificada" : amount}</DetailRow>
            </>
          ) : null}
          <DetailRow label="Fecha">{longDate}</DetailRow>
          <DetailRow label="Donante">
            {donation.donor_id ? <Link href={`/donors/${donation.donor_id}`} className="inline-flex min-h-[48px] items-center break-words font-medium text-brand underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand">{donation.donor_name?.trim() || "Ver donante"}</Link> : "No se conoce el donante"}
          </DetailRow>
          {!supplies ? (
            <DetailRow label="Método de pago">
              {donation.method?.trim() || "No indicado"}
            </DetailRow>
          ) : null}
          {donation.concept && <DetailRow label="Concepto">{donation.concept}</DetailRow>}
          {donation.notes && <DetailRow label="Notas">{donation.notes}</DetailRow>}
        </dl>
      </Card>

      {donation.id ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink
            href={`/donations/${donation.id}/edit`}
            variant="secondary"
            icon={<Pencil aria-hidden className="size-5" />}
          >
            Editar
          </ButtonLink>
          <DeleteDonationButton
            donationId={donation.id}
            amountLabel={supplies ? `${donation.item_description} · ${amount}` : amount}
            dateLabel={dateLabel}
          />
        </div>
      ) : null}
      <Disclosure title="Datos del registro"><p className="text-[16px] text-ink-soft">Registrada por {who(donation.created_by_name)} el {created}</p><p className="text-[16px] text-ink-soft">Última edición por {who(donation.updated_by_name)} el {updated}</p></Disclosure>
    </div>
  );
}
