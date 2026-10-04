import type { ReactNode } from "react";
import {
  Banknote,
  Gift,
  Landmark,
  Pencil,
  Send,
  Smartphone,
  Wallet,
} from "lucide-react";
import { DeleteDonationButton } from "@/components/delete-donation-button";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  formatDate,
  formatDateTime,
  formatLongDate,
} from "@/lib/format";
import { donationValueLabel } from "@/lib/donations/presentation";
import type { DonationListRow } from "@/types/database";

function MethodIcon({ method }: { method: string | null }) {
  const iconClass = "size-4";

  switch ((method ?? "").trim().toLowerCase()) {
    case "efectivo":
      return <Banknote aria-hidden className={iconClass} />;
    case "transferencia":
      return <Landmark aria-hidden className={iconClass} />;
    case "pago móvil":
    case "pago movil":
      return <Smartphone aria-hidden className={iconClass} />;
    case "zelle":
      return <Send aria-hidden className={iconClass} />;
    case "en especie":
      return <Gift aria-hidden className={iconClass} />;
    default:
      return <Wallet aria-hidden className={iconClass} />;
  }
}

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
      <dd className="min-w-0 break-words text-ink">{children}</dd>
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
        <p className="break-words text-[32px] leading-tight font-bold text-ink">
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
            {donation.donor_name?.trim() || "—"}
          </DetailRow>
          {!supplies ? (
            <DetailRow label="Método de pago">
              <Badge icon={<MethodIcon method={donation.method} />}>
                {donation.method?.trim() || "—"}
              </Badge>
            </DetailRow>
          ) : null}
          <DetailRow label="Concepto">{donation.concept || "—"}</DetailRow>
          <DetailRow label="Notas">{donation.notes || "—"}</DetailRow>
        </dl>
        <p className="text-ink-soft">
          Registrada por {who(donation.created_by_name)} el {created}
          {" · "}
          Última edición por {who(donation.updated_by_name)} el {updated}
        </p>
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
    </div>
  );
}
