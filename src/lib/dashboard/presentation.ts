import type { Json } from "@/types/supabase";

export type RankingRow = { label: string; value: number; id?: string; detail?: string };
export type Dashboard = {
  total: number; moneyCount: number; suppliesCount: number; unnamedCount: number;
  moneyTotals: Json; donors: RankingRow[]; items: RankingRow[]; categories: RankingRow[];
};
function object(value: Json | undefined): { [key: string]: Json | undefined } {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function number(value: Json | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}
function ranking(value: Json | undefined): RankingRow[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const row = object(item);
    if (typeof row.label !== "string" || number(row.value) <= 0) return [];
    return [{ label: row.label, value: number(row.value),
      id: typeof row.id === "string" ? row.id : undefined,
      detail: typeof row.detail === "string" ? row.detail : undefined }];
  });
}
export function parseDashboard(value: Json): Dashboard {
  const data = object(value);
  return { total: number(data.total), moneyCount: number(data.money_count),
    suppliesCount: number(data.supplies_count), unnamedCount: number(data.unnamed_count),
    moneyTotals: object(data.money_totals), donors: ranking(data.donors),
    items: ranking(data.items), categories: ranking(data.categories) };
}
export function barWidth(value: number, maximum: number): number {
  return maximum > 0 ? Math.max(0, Math.min(100, value / maximum * 100)) : 0;
}

// Dos intervalos legibles y una escala que siempre empieza en cero.
export function chartScale(values: number[], integer: boolean) {
  const maximum = Math.max(0, ...values.filter(Number.isFinite));
  if (maximum <= 0) return { maximum: 2, ticks: [0, 1, 2] };
  const target = maximum / 2;
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude)
    .find((candidate) => candidate >= target) ?? magnitude * 10;
  const interval = integer ? Math.max(1, Math.ceil(step)) : step;
  return { maximum: interval * 2, ticks: [0, interval, interval * 2] };
}
export function dashboardFilters(params: Record<string, string | string[] | undefined>) {
  return { currency: typeof params.moneda === "string" && /^[A-Za-z]{3}$/.test(params.moneda) ? params.moneda.toUpperCase() : "USD" };
}
