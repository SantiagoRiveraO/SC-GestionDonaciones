import Link from "next/link";
import {
  Banknote,
  Gift,
  Landmark,
  Send,
  Smartphone,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { donationValueLabel } from "@/lib/donations/presentation";
import type { DonationListRow } from "@/types/database";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

type DonationsTableProps = {
  rows: DonationListRow[];
  total: number;
};

function donationDate(donation: DonationListRow) {
  return donation.donated_at ? formatDate(donation.donated_at) : "—";
}

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

function DonationRowContent({ donation }: { donation: DonationListRow }) {
  return (
    <>
      <div className="min-w-0 space-y-1">
        <p className="text-ink-soft">{donationDate(donation)}</p>
        <p className="font-bold text-ink">
          {donation.donor_name?.trim() || "Sin donante"}
        </p>
        {donation.item_description ? <p className="break-words text-ink">{donation.item_description}</p> : null}
        {donation.concept && donation.concept !== donation.item_description ? (
          <p className="text-ink">{donation.concept}</p>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col gap-2 sm:items-end sm:text-right">
        <p className="break-words text-lg font-bold text-ink">{donationValueLabel(donation)}</p>
        <Badge icon={donation.kind === "supplies" ? <Gift aria-hidden className="size-4" /> : <MethodIcon method={donation.method} />}>
          {donation.kind === "supplies" ? "Insumos" : donation.method?.trim() || "Dinero"}
        </Badge>
        {donation.kind === "supplies" && donation.category_name ? <Badge>{donation.category_name}</Badge> : null}
      </div>
    </>
  );
}

export function DonationsTable({ rows, total }: DonationsTableProps) {
  return (
    <ul
      className="space-y-3"
      aria-label={`Donaciones encontradas (${total})`}
    >
      {rows.map((donation, index) => {
        const href = donation.id ? `/donations/${donation.id}` : undefined;

        return (
          <li key={donation.id ?? `donation-${index}`}>
            {href ? (
              <Card className="p-0">
                <Link
                  href={href}
                  className={`flex min-h-[72px] flex-col justify-between gap-2 rounded-[12px] p-4 sm:flex-row sm:items-center sm:gap-4 ${focusRing}`}
                >
                  <DonationRowContent donation={donation} />
                </Link>
              </Card>
            ) : (
              <Card className="flex min-h-[72px] flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                <DonationRowContent donation={donation} />
              </Card>
            )}
          </li>
        );
      })}
    </ul>
  );
}
