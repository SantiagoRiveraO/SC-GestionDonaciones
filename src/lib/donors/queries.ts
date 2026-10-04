import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isDonationId } from "@/lib/donations/validation";
import type { DonorFilters } from "@/lib/donors/filters";

export const DONOR_PAGE_SIZE = 25;

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
