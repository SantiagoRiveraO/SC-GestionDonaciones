import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
        const moneyLabels = donorMoneyLabels(donor.money_totals);
        const totals = donor.money_totals && typeof donor.money_totals === "object" && !Array.isArray(donor.money_totals) ? donor.money_totals : {};
        const selectedAmount = totals[filters.currency];
        return (
          <li key={donor.id}>
            <Card className="p-0">
              <Link href={`/donors/${donor.id}`} className="grid min-h-[96px] gap-4 rounded-[12px] p-5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand sm:grid-cols-2 sm:p-6">
                <div className="min-w-0 space-y-1">
                  <p className="break-words text-xl font-bold text-ink">{donor.full_name}</p>
                  {donor.phone ? <p className="break-words text-ink">{donor.phone}</p> : donor.email ? <p className="break-words text-ink">{donor.email}</p> : null}
                  <p className="text-ink-soft">{donor.last_donation_date ? `Última donación: ${formatDate(donor.last_donation_date)}` : "Todavía no tiene donaciones registradas."}</p>
                </div>
                <div className="min-w-0 space-y-2 sm:text-right">
                  <p className="text-2xl font-bold text-ink">{filters.sort === "money" ? formatMoney(typeof selectedAmount === "number" ? selectedAmount : 0, filters.currency) : `${count} ${count === 1 ? "donación" : "donaciones"}`}</p>
                  {filters.sort === "money" ? <p className="text-ink-soft">{count} {count === 1 ? "donación" : "donaciones"} en total</p> : null}
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {moneyLabels.map((label) => <Badge key={label}>{label}</Badge>)}
                    {(donor.supplies_count ?? 0) > 0 ? <Badge>{donor.supplies_count} de insumos</Badge> : null}
                  </div>
                  <p className="font-bold text-brand">Ver donante →</p>
                </div>
              </Link>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
