export const DONOR_SORTS = [
  { value: "frequency", label: "Más donaciones" },
  { value: "money", label: "Mayor aporte de dinero" },
  { value: "recent", label: "Donación más reciente" },
  { value: "name", label: "Nombre (A a Z)" },
] as const;
export type DonorSort = (typeof DONOR_SORTS)[number]["value"];
export type DonorFilters = { q: string; sort: DonorSort; currency: string; page: number };

export function parseDonorFilters(params: Record<string, string | string[] | undefined>): DonorFilters {
  const value = (key: string) => Array.isArray(params[key]) ? params[key][0] ?? "" : params[key] ?? "";
  const sort = DONOR_SORTS.find((item) => item.value === value("orden"))?.value ?? "frequency";
  const currency = /^[a-zA-Z]{3}$/.test(value("moneda")) ? value("moneda").toUpperCase() : "USD";
  const pageText = value("pagina");
  const page = /^[1-9]\d*$/.test(pageText) && Number.isSafeInteger(Number(pageText)) ? Number(pageText) : 1;
  return { q: value("q").trim(), sort, currency, page };
}

export function donorsHref(filters: Partial<DonorFilters>) {
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.sort && filters.sort !== "frequency") params.set("orden", filters.sort);
  if (filters.sort === "money" && filters.currency) params.set("moneda", filters.currency);
  if (filters.page && filters.page > 1) params.set("pagina", String(filters.page));
  return params.size ? `/donors?${params}` : "/donors";
}
