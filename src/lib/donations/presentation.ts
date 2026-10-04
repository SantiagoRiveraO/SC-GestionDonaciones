import { formatMoney } from "@/lib/format";
import type { DonationListRow, DonationSummaryRow } from "@/types/database";

const QUANTITY_FORMAT = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 });

export function donationValueLabel(
  donation: Pick<DonationListRow, "kind" | "amount" | "currency" | "quantity" | "unit">,
): string {
  if (donation.kind === "supplies") {
    return donation.quantity != null && donation.unit
      ? `${QUANTITY_FORMAT.format(donation.quantity)} ${donation.unit}`
      : "Cantidad no especificada";
  }
  return donation.amount != null && donation.currency
    ? formatMoney(donation.amount, donation.currency)
    : "—";
}

export function donationSummaryLabels(rows: DonationSummaryRow[]): string[] {
  const money = rows
    .filter((row): row is DonationSummaryRow & { currency: string } => row.kind === "money" && Boolean(row.currency))
    .sort((a, b) => (a.currency ?? "").localeCompare(b.currency ?? ""))
    .map((row) => formatMoney(row.total, row.currency));
  const supplies = rows.filter((row) => row.kind === "supplies")
    .reduce((sum, row) => sum + row.donation_count, 0);
  return supplies > 0
    ? [...money, `${supplies} ${supplies === 1 ? "donación" : "donaciones"} de insumos`]
    : money;
}
