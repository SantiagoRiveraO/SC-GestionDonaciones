import { isValidIsoDate } from "@/lib/donations/validation";
import { parseSupplyCategory, type SupplyCategory } from "@/lib/donations/categories";

export type DonationSearchFilters = {
  category: SupplyCategory | null;
  kind: "money" | "supplies" | null;
  q: string | null;
  currency: string | null;
  method: string | null;
  from: string | null;
  to: string | null;
};

export type DonationListParams = DonationSearchFilters & {
  page: number;
};

export type SearchParamsInput =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

const CURRENCY_PATTERN = /^[A-Za-z]{3}$/;
const PAGE_PATTERN = /^[1-9]\d*$/;

function readParam(source: SearchParamsInput, key: string): string | null {
  if (source instanceof URLSearchParams) {
    return source.get(key);
  }

  const value = source[key];
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function emptyToNull(value: string | null): string | null {
  if (value == null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function parseCurrency(raw: string | null): string | null {
  const value = emptyToNull(raw);
  if (!value || !CURRENCY_PATTERN.test(value)) {
    return null;
  }

  return value.toUpperCase();
}

function parseDate(raw: string | null): string | null {
  const value = emptyToNull(raw);
  if (!value || !isValidIsoDate(value)) {
    return null;
  }

  return value;
}

function parsePage(raw: string | null): number {
  const value = emptyToNull(raw);
  if (!value || !PAGE_PATTERN.test(value)) {
    return 1;
  }

  const page = Number(value);
  return Number.isSafeInteger(page) ? page : 1;
}

export function parseDonationFilters(
  searchParams: SearchParamsInput,
): DonationListParams {
  const kind = readParam(searchParams, "tipo");
  const category = kind === "money" ? null : parseSupplyCategory(readParam(searchParams, "categoria"));
  return {
    category,
    kind: category ? "supplies" : kind === "money" || kind === "supplies" ? kind : null,
    q: emptyToNull(readParam(searchParams, "q")),
    currency: kind === "supplies" || category ? null : parseCurrency(readParam(searchParams, "moneda")),
    method: kind === "supplies" || category ? null : emptyToNull(readParam(searchParams, "metodo")),
    from: parseDate(readParam(searchParams, "desde")),
    to: parseDate(readParam(searchParams, "hasta")),
    page: parsePage(readParam(searchParams, "pagina")),
  };
}

export function hasActiveSearchFilters(filters: DonationSearchFilters): boolean {
  return Boolean(
    filters.category || filters.kind || filters.q || filters.currency || filters.method || filters.from || filters.to,
  );
}

export function donationsListHref(filters: Partial<DonationListParams>): string {
  const query = serializeDonationFilters(filters).toString();
  return query ? `/donations?${query}` : "/donations";
}

export function serializeDonationFilters(
  filters: Partial<DonationListParams>,
): URLSearchParams {
  const params = new URLSearchParams();
  const category = filters.kind === "money" ? null : parseSupplyCategory(filters.category);
  if (category) {
    params.set("categoria", category);
    params.set("tipo", "supplies");
  }
  if (filters.kind === "money" || filters.kind === "supplies") {
    params.set("tipo", filters.kind);
  }
  const q = emptyToNull(filters.q ?? null);
  const currency = parseCurrency(filters.currency ?? null);
  const method = emptyToNull(filters.method ?? null);
  const from = parseDate(filters.from ?? null);
  const to = parseDate(filters.to ?? null);
  const page = filters.page ?? 1;

  if (q) {
    params.set("q", q);
  }
  if (currency && filters.kind !== "supplies" && !category) {
    params.set("moneda", currency);
  }
  if (method && filters.kind !== "supplies" && !category) {
    params.set("metodo", method);
  }
  if (from) {
    params.set("desde", from);
  }
  if (to) {
    params.set("hasta", to);
  }
  if (page > 1) {
    params.set("pagina", String(page));
  }

  return params;
}
