"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { isDonationId } from "@/lib/donations/validation";
import { parseDonorInput, type DonorFieldErrors, type DonorValues } from "@/lib/donors/validation";
import { findPotentialDonors } from "@/lib/donors/queries";
import type { DonorOption } from "@/lib/donors/selection";

export type DonorActionState = { values: DonorValues; errors: DonorFieldErrors; formError: string | null; matches?: DonorOption[] };

export async function saveDonor(id: string | null, _previous: DonorActionState | null, formData: FormData): Promise<DonorActionState> {
  await requireUser();
  const read = (field: string) => typeof formData.get(field) === "string" ? String(formData.get(field)) : "";
  const values = { full_name: read("full_name"), phone: read("phone"), email: read("email"), notes: read("notes") };
  const parsed = parseDonorInput(values);
  if (!parsed.ok) return { values, errors: parsed.errors, formError: null };
  if (id && !isDonationId(id)) return { values, errors: {}, formError: "No se encontró el donante." };
  let savedId: string;
  try {
    if (!id && formData.get("confirm_distinct") !== "yes") {
      const matches = await findPotentialDonors(values);
      if (matches.length) return { values, errors: {}, formError: "Encontramos donantes parecidos. Revisa si es uno de ellos antes de crear otro.", matches };
    }
    const supabase = await createClient();
    const query = id ? supabase.from("donors").update(parsed.data).eq("id", id) : supabase.from("donors").insert(parsed.data);
    const { data, error } = await query.select("id").maybeSingle();
    if (error?.code === "23505") {
      return { values, errors: { full_name: "Ya existe un donante con ese nombre. Búscalo en Donantes para actualizar sus datos." }, formError: null };
    }
    if (error || !data) return { values, errors: {}, formError: "No se pudo guardar el donante. Intenta de nuevo." };
    savedId = data.id;
  } catch {
    return { values, errors: {}, formError: "No se pudo guardar el donante. Intenta de nuevo." };
  }
  revalidatePath("/", "layout");
  redirect(`/donors/${savedId}?estado=${id ? "actualizado" : "creado"}`);
}
