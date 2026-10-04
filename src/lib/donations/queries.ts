import "server-only";
import type { SupplyCategoryOption } from "@/lib/donations/categories";

import { createClient } from "@/lib/supabase/server";
import type { DonationSearchFilters } from "@/lib/donations/filters";
import { isDonationId } from "@/lib/donations/validation";
import { firstDayOfMonthInCaracas, todayInCaracas } from "@/lib/format";
import type { DonationListRow, DonationSummaryRow } from "@/types/database";
import type { Json } from "@/types/supabase";

export const DONATION_PAGE_SIZE = 25;

export type DonationListResult = {
  rows: DonationListRow[];
  total: number;
  page: number;
  pageCount: number;
};

export type DonationFilterOptions = {
  currencies: string[];
  methods: string[];
};

function toRpcFilters(filters: DonationSearchFilters) {
  return {
    p_kind: filters.kind ?? undefined,
    p_category: filters.category ?? undefined,
    p_query: filters.q ?? undefined,
    p_currency: filters.currency ?? undefined,
    p_method: filters.method ?? undefined,
    p_from: filters.from ?? undefined,
    p_to: filters.to ?? undefined,
  };
}

function throwQueryError(message: string): never {
  throw new Error(message);
}

function asStringArray(value: Json | undefined): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function parseFilterOptions(value: Json | null): DonationFilterOptions {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { currencies: [], methods: [] };
  }

  return {
    currencies: asStringArray(value.currencies),
    methods: asStringArray(value.methods),
  };
}

async function countDonations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filters: DonationSearchFilters,
): Promise<number> {
  const { count, error } = await supabase.rpc(
    "search_donations",
    toRpcFilters(filters),
    { count: "exact", head: true },
  );

  if (error) {
    throwQueryError("No se pudieron cargar las donaciones.");
  }

  return count ?? 0;
}

function toListResult(
  rows: DonationListRow[],
  total: number,
  page: number,
): DonationListResult {
  return {
    rows,
    total,
    page,
    pageCount: total === 0 ? 0 : Math.ceil(total / DONATION_PAGE_SIZE),
  };
}

export async function listDonations(
  filters: DonationSearchFilters,
  page: number,
): Promise<DonationListResult> {
  const supabase = await createClient();
  const safePage = page < 1 ? 1 : page;
  const from = (safePage - 1) * DONATION_PAGE_SIZE;
  const to = from + DONATION_PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .rpc("search_donations", toRpcFilters(filters), { count: "exact" })
    .order("donated_at", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error?.code === "PGRST103") {
    const total = await countDonations(supabase, filters);
    return toListResult([], total, safePage);
  }

  if (error) {
    throwQueryError("No se pudieron cargar las donaciones.");
  }

  return toListResult(data ?? [], count ?? 0, safePage);
}

export type MonthSummary = {
  rows: DonationSummaryRow[];
  total: number;
};

const EMPTY_SEARCH_FILTERS: DonationSearchFilters = {
  category: null,
  kind: null,
  q: null,
  currency: null,
  method: null,
  from: null,
  to: null,
};

export async function getMonthSummary(): Promise<MonthSummary> {
  const rows = await getDonationSummary({
    ...EMPTY_SEARCH_FILTERS,
    from: firstDayOfMonthInCaracas(),
    to: todayInCaracas(),
  });

  return {
    rows,
    total: rows.reduce((sum, row) => sum + row.donation_count, 0),
  };
}

export async function listRecentDonations(
  limit = 5,
): Promise<DonationListRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("search_donations", toRpcFilters(EMPTY_SEARCH_FILTERS))
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throwQueryError("No se pudieron cargar las donaciones.");
  }

  return data ?? [];
}

export async function getDonationSummary(
  filters: DonationSearchFilters,
): Promise<DonationSummaryRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "donation_summary",
    toRpcFilters(filters),
  );

  if (error) {
    throwQueryError("No se pudo cargar el resumen.");
  }

  return data ?? [];
}

export async function getFilterOptions(): Promise<DonationFilterOptions> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("donation_filter_options");

  if (error) {
    throwQueryError("No se pudieron cargar los filtros.");
  }

  return parseFilterOptions(data);
}

export async function getDonation(id: string): Promise<DonationListRow | null> {
  if (!isDonationId(id)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("donation_list")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throwQueryError("No se pudo cargar la donación.");
  }

  return data;
}

export async function listDonorNames(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("donors")
    .select("full_name")
    .order("full_name", { ascending: true })
    .limit(500);

  if (error) {
    throwQueryError("No se pudieron cargar los donantes.");
  }

  return (data ?? []).map((row) => row.full_name);
}

export async function listSupplyCategories(): Promise<SupplyCategoryOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("supply_categories").select("id, name").order("name");
  if (error) throwQueryError("No se pudieron cargar las categorías.");
  return (data ?? []).map(({ id, name }) => ({ value: id, label: name }));
}
