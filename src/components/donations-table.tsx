import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { donationValueLabel } from "@/lib/donations/presentation";
import type { DonationListRow } from "@/types/database";

function DonationRowContent({ donation }: { donation: DonationListRow }) {
  const supplies = donation.kind === "supplies";
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap justify-between gap-x-4 text-[16px] text-ink-soft">
        <p>{donation.donated_at ? formatDate(donation.donated_at) : "Fecha no indicada"}</p>
        <p>{supplies ? "Insumos" : "Dinero"}</p>
      </div>
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 break-words font-bold text-ink">{donation.donor_name?.trim() || "Donante no identificado"}</p>
        {donation.id && <ChevronRight aria-hidden className="size-5 shrink-0 text-brand" />}
      </div>
      {supplies && <p className="break-words text-xl font-bold text-ink">{donation.item_description}</p>}
      <p className={`break-words font-bold tabular-nums ${supplies ? "text-lg text-ink" : "text-[24px] leading-tight text-ink"}`}>{donationValueLabel(donation)}</p>
      {(supplies ? donation.category_name : donation.method) && <p className="break-words text-[16px] text-ink-soft">{supplies ? donation.category_name : donation.method}</p>}
      {donation.concept && donation.concept !== donation.item_description && <p className="break-words text-[16px] text-ink-soft">{donation.concept}</p>}
      {donation.id && <span className="sr-only">Ver donación</span>}
    </div>
  );
}

export function DonationsTable({ rows, total }: { rows: DonationListRow[]; total: number }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2" aria-label={`Donaciones encontradas (${total})`}>
      {rows.map((donation, index) => (
        <li key={donation.id ?? `donation-${index}`}>
          <Card className="h-full p-0">
            {donation.id ? <Link href={`/donations/${donation.id}`} className="block h-full min-h-[72px] rounded-[12px] p-4 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand"><DonationRowContent donation={donation} /></Link> : <div className="p-4"><DonationRowContent donation={donation} /></div>}
          </Card>
        </li>
      ))}
    </ul>
  );
}
