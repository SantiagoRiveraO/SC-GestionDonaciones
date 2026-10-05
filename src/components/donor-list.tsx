import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDate, formatMoney } from "@/lib/format";
import { donorMoneyLabels } from "@/lib/donors/presentation";
import type { DonorFilters } from "@/lib/donors/filters";
import type { DonorOverview } from "@/types/database";

export function DonorList({ rows, filters }: { rows: DonorOverview[]; filters: DonorFilters }) {
  return (
    <ul aria-label="Donantes encontrados" className="space-y-3">
      {rows.map((donor) => {
        const count = donor.donation_count ?? 0;
        const moneyLabels = donorMoneyLabels(donor.money_totals).filter((label) => filters.sort !== "money" || !label.startsWith(`${filters.currency} `));
        const totals = donor.money_totals && typeof donor.money_totals === "object" && !Array.isArray(donor.money_totals) ? donor.money_totals : {};
        const selectedAmount = totals[filters.currency];
        return (
          <li key={donor.id}>
            <Card className="p-0">
              <Link href={`/donors/${donor.id}`} className="grid min-h-[96px] gap-3 rounded-[12px] p-4 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand sm:grid-cols-2 sm:gap-4 sm:p-5">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-3"><p className="min-w-0 break-words text-lg font-bold text-brand underline underline-offset-4">{donor.full_name}</p><ChevronRight aria-hidden className="size-5 shrink-0 text-brand sm:hidden" /></div>
                  {donor.phone ? <p className="break-words text-ink">{donor.phone}</p> : donor.email ? <p className="break-words text-ink">{donor.email}</p> : null}
                  <p className="text-[16px] text-ink-soft">{donor.last_donation_date ? `Última donación: ${formatDate(donor.last_donation_date)}` : "Todavía no tiene donaciones registradas."}</p>
                </div>
                <div className="min-w-0 space-y-2 border-t border-zinc-200 pt-3 sm:border-0 sm:pt-0 sm:text-right">
                  {filters.sort === "money" && <div><p className="text-[16px] text-ink-soft">Total aportado en {filters.currency}</p><p className="break-words text-xl font-bold tabular-nums text-ink">{formatMoney(typeof selectedAmount === "number" ? selectedAmount : 0, filters.currency)}</p></div>}
                  <p className="font-medium text-ink">{count} {count === 1 ? "donación registrada" : "donaciones registradas"}</p>
                  {moneyLabels.length > 0 && <div><p className="text-[16px] text-ink-soft">{filters.sort === "money" ? "Otras monedas" : "Dinero aportado"}</p><ul>{moneyLabels.map((label) => <li key={label} className="break-words font-bold tabular-nums text-ink">{label}</li>)}</ul></div>}
                  {(donor.supplies_count ?? 0) > 0 && <p className="text-[16px] text-ink-soft">Insumos: {donor.supplies_count} {donor.supplies_count === 1 ? "donación" : "donaciones"}</p>}
                  <p className="sr-only">Ver donante →</p>
                </div>
              </Link>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
