import "server-only";
import { createClient } from "@/lib/supabase/server";
import { parseDashboard } from "@/lib/dashboard/presentation";

export async function getDashboard(kind: string, currency: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_donation_dashboard", { p_kind: kind, p_currency: currency });
  if (error || data === null) throw new Error("No se pudo cargar el resumen.");
  return parseDashboard(data);
}
