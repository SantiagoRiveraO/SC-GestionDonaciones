import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isDonationId } from "@/lib/donations/validation";
import type { DonorFilters } from "@/lib/donors/filters";
import { donorWords, possibleSameDonor, type DonorOption } from "@/lib/donors/selection";

export const DONOR_PAGE_SIZE = 25;

export async function searchDonorOptions(query: string) {
  const supabase = await createClient();
  const { data, count, error } = await supabase.rpc("search_donors", { p_query: query.trim().slice(0, 200), p_sort: "name" }, { count: "exact" }).range(0, 9);
  if (error) throw new Error("No se pudieron buscar los donantes.");
  const options: DonorOption[] = (data ?? []).flatMap((row) => row.id && row.full_name ? [{ id: row.id, full_name: row.full_name, phone: row.phone, email: row.email }] : []);
  return { options, more: (count ?? 0) > options.length };
}

export async function findPotentialDonors(values: { full_name: string; phone: string; email: string }) {
  const terms = [...new Set([values.email.trim(), values.phone.replace(/\D/g, "").slice(-4), ...donorWords(values.full_name).slice(0, 3).map((word) => word.slice(0, 4))].filter((term) => term.length >= 3))];
  const results = await Promise.all(terms.map(searchDonorOptions));
  return [...new Map(results.flatMap((result) => result.options).filter((option) => possibleSameDonor(option, values)).map((option) => [option.id, option])).values()].slice(0, 5);
}

export async function listDonors(filters: DonorFilters) {
  const supabase = await createClient();
  const args = { p_query: filters.q, p_sort: filters.sort, p_currency: filters.currency };
  const from = (filters.page - 1) * DONOR_PAGE_SIZE;
  const { data, count, error } = await supabase.rpc("search_donors", args, { count: "exact" }).range(from, from + DONOR_PAGE_SIZE - 1);
  if (error?.code === "PGRST103") {
    const total = await supabase.rpc("search_donors", args, { count: "exact", head: true });
    if (total.error) throw new Error("No se pudieron cargar los donantes.");
    return { rows: [], total: total.count ?? 0 };
  }
  if (error) throw new Error("No se pudieron cargar los donantes.");
  return { rows: data ?? [], total: count ?? 0 };
}

export async function getDonor(id: string) {
  if (!isDonationId(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("donor_overview").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("No se pudo cargar el donante.");
  return data;
}

export async function donorHistory(id: string, page: number) {
  const supabase = await createClient();
  const from = (page - 1) * DONOR_PAGE_SIZE;
  const { data, count, error } = await supabase.from("donation_list").select("*", { count: "exact" }).eq("donor_id", id)
    .order("donated_at", { ascending: false }).order("created_at", { ascending: false }).order("id").range(from, from + DONOR_PAGE_SIZE - 1);
  if (error?.code === "PGRST103") {
    const total = await supabase.from("donation_list").select("*", { count: "exact", head: true }).eq("donor_id", id);
    if (total.error) throw new Error("No se pudo cargar el historial.");
    return { rows: [], total: total.count ?? 0 };
  }
  if (error) throw new Error("No se pudo cargar el historial.");
  return { rows: data ?? [], total: count ?? 0 };
}
