"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { findPotentialDonors, searchDonorOptions } from "@/lib/donors/queries";
import { parseDonorInput, type DonorFieldErrors } from "@/lib/donors/validation";
import type { DonorOption } from "@/lib/donors/selection";

export async function findDonors(query: string): Promise<{ options: DonorOption[]; more: boolean; error: string | null }> {
  await requireUser();
  try { return { ...await searchDonorOptions(typeof query === "string" ? query : ""), error: null }; }
  catch { return { options: [], more: false, error: "No se pudieron buscar los donantes. Intenta de nuevo." }; }
}

export async function registerDonorForDonation(form: FormData): Promise<{ donor: DonorOption | null; errors: DonorFieldErrors; error: string | null; matches: DonorOption[] }> {
  await requireUser();
  const read = (key: string) => typeof form.get(key) === "string" ? String(form.get(key)) : "";
  const values = { full_name: read("full_name"), phone: read("phone"), email: read("email"), notes: "" };
  const parsed = parseDonorInput(values);
  if (!parsed.ok) return { donor: null, errors: parsed.errors, error: null, matches: [] };
  try {
    if (form.get("confirm_distinct") !== "yes") {
      const matches = await findPotentialDonors(values);
      if (matches.length) return { donor: null, errors: {}, error: "Encontramos donantes parecidos. Revisa si es uno de ellos antes de crear otro.", matches };
    }
    const supabase = await createClient();
    const { data, error } = await supabase.from("donors").insert(parsed.data).select("id, full_name, phone, email").single();
    if (error || !data) return { donor: null, errors: {}, error: error?.code === "23505" ? "Ya existe un donante con ese nombre. Búscalo y selecciónalo." : "No se pudo registrar el donante. Intenta de nuevo.", matches: [] };
    revalidatePath("/", "layout");
    return { donor: data, errors: {}, error: null, matches: [] };
  } catch { return { donor: null, errors: {}, error: "No se pudo registrar el donante. Intenta de nuevo.", matches: [] }; }
}
