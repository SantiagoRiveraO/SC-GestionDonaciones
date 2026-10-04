import type { Json } from "@/types/supabase";
import { formatMoney } from "@/lib/format";

export function donorMoneyLabels(totals: Json | null | undefined): string[] {
  if (!totals || typeof totals !== "object" || Array.isArray(totals)) return [];
  return Object.entries(totals)
    .filter((entry): entry is [string, number] => /^[A-Z]{3}$/.test(entry[0]) && typeof entry[1] === "number" && Number.isFinite(entry[1]) && entry[1] >= 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, amount]) => formatMoney(amount, currency));
}
