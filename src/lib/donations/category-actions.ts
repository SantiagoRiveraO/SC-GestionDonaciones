"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { categoryNameError, parseSupplyCategory } from "@/lib/donations/categories";

export type CategoryActionState = {
  error: string | null;
  name: string;
  category: { id: string; name: string } | null;
};

export async function saveCategory(
  _previous: CategoryActionState | null,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const rawId = formData.get("id");
  const id = parseSupplyCategory(rawId);
  const error = categoryNameError(name);
  if (error || (rawId && !id)) {
    return { error: error ?? "No se encontró la categoría.", name, category: null };
  }
  try {
    const supabase = await createClient();
    const query = id
      ? supabase.from("supply_categories").update({ name }).eq("id", id)
      : supabase.from("supply_categories").insert({ name });
    const { data, error: writeError } = await query.select("id, name").maybeSingle();
    if (writeError || !data) {
      return {
        error: writeError?.code === "23505"
          ? "Ya existe una categoría con ese nombre. Elige otro nombre."
          : "No se pudo guardar la categoría. Intenta de nuevo.",
        name,
        category: null,
      };
    }
    revalidatePath("/", "layout");
    return { error: null, name, category: data };
  } catch {
    return { error: "No se pudo guardar la categoría. Intenta de nuevo.", name, category: null };
  }
}
