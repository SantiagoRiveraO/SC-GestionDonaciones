"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  isDonationId,
  parseDonationInput,
  type DonationFieldErrors,
  type DonationInputValues,
} from "@/lib/donations/validation";

export type DonationActionValues = {
  id: string;
  amount: string;
  currency: string;
  donated_at: string;
  method: string;
  concept: string;
  notes: string;
  donor_name: string;
};

export type DonationActionState = {
  fieldErrors: DonationFieldErrors;
  formError: string | null;
  values: DonationActionValues;
};

const SESSION_ERROR_CODES = new Set([
  "PGRST301",
  "PGRST303",
  "bad_jwt",
  "session_expired",
  "session_not_found",
]);

const CONSTRAINT_FIELDS: Record<string, keyof DonationFieldErrors> = {
  donations_amount_nonnegative: "amount",
  donations_currency_format: "currency",
  donations_donated_at_min: "donated_at",
  donations_donated_at_not_future: "donated_at",
  donations_method_length: "method",
  donations_concept_length: "concept",
  donations_notes_length: "notes",
  donors_full_name_length: "donor_name",
};

const CONSTRAINT_MESSAGES: Record<string, string> = {
  donations_amount_nonnegative: "Escribe el monto con números. Ejemplo: 25,50",
  donations_currency_format: "Ingresa una moneda de 3 letras.",
  donations_donated_at_min: "Ingresa una fecha válida.",
  donations_donated_at_not_future: "La fecha no puede ser futura.",
  donations_method_length: "Máximo 50 caracteres.",
  donations_concept_length: "Máximo 200 caracteres.",
  donations_notes_length: "Máximo 2000 caracteres.",
  donors_full_name_length: "Máximo 200 caracteres.",
};

function readFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readFormValues(formData: FormData): DonationActionValues {
  return {
    id: readFormString(formData, "id"),
    amount: readFormString(formData, "amount"),
    currency: readFormString(formData, "currency"),
    donated_at: readFormString(formData, "donated_at"),
    method: readFormString(formData, "method"),
    concept: readFormString(formData, "concept"),
    notes: readFormString(formData, "notes"),
    donor_name: readFormString(formData, "donor_name"),
  };
}

function toInputValues(values: DonationActionValues): DonationInputValues {
  return {
    amount: values.amount,
    currency: values.currency,
    donated_at: values.donated_at,
    method: values.method,
    concept: values.concept,
    notes: values.notes,
    donor_name: values.donor_name,
  };
}

function actionError(
  values: DonationActionValues,
  formError: string | null,
  fieldErrors: DonationFieldErrors = {},
): DonationActionState {
  return { fieldErrors, formError, values };
}

function isNextControlFlowError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    (error.digest.startsWith("NEXT_REDIRECT") ||
      error.digest.startsWith("NEXT_NOT_FOUND"))
  );
}

function findConstraintName(error: {
  message?: string;
  details?: string;
  hint?: string;
}): string | null {
  const haystack = [error.message, error.details, error.hint]
    .filter(Boolean)
    .join(" ");

  for (const name of Object.keys(CONSTRAINT_FIELDS)) {
    if (haystack.includes(name)) {
      return name;
    }
  }

  return null;
}

function translateWriteError(
  values: DonationActionValues,
  error: {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  },
): DonationActionState {
  if (
    error.code === "42501" ||
    error.message?.toLowerCase().includes("row-level security")
  ) {
    return actionError(values, "No tienes permiso para esta acción.");
  }

  const combined = [error.code, error.message, error.details, error.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    (error.code && SESSION_ERROR_CODES.has(error.code)) ||
    combined.includes("jwt") ||
    combined.includes("not authenticated") ||
    combined.includes("session")
  ) {
    return actionError(values, "Tu sesión expiró. Vuelve a iniciar sesión.");
  }

  const constraint = findConstraintName(error);
  if (constraint) {
    const field = CONSTRAINT_FIELDS[constraint];
    const message = CONSTRAINT_MESSAGES[constraint];
    return {
      fieldErrors: { [field]: message },
      formError: null,
      values,
    };
  }

  return actionError(values, "No se pudo guardar. Intenta de nuevo.");
}

async function resolveDonorId(
  donorName: string | null,
): Promise<{ donorId: string | null; error: DonationActionState | null }> {
  if (!donorName) {
    return { donorId: null, error: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("ensure_donor", {
    p_full_name: donorName,
  });

  if (error) {
    return {
      donorId: null,
      error: translateWriteError(
        {
          id: "",
          amount: "",
          currency: "",
          donated_at: "",
          method: "",
          concept: "",
          notes: "",
          donor_name: donorName,
        },
        error,
      ),
    };
  }

  return { donorId: data ?? null, error: null };
}

function donationWritePayload(
  parsed: {
    amount: number;
    currency: string;
    donated_at: string;
    method: string | null;
    concept: string | null;
    notes: string | null;
  },
  donorId: string | null,
) {
  return {
    amount: parsed.amount,
    currency: parsed.currency,
    donated_at: parsed.donated_at,
    method: parsed.method,
    concept: parsed.concept,
    notes: parsed.notes,
    donor_id: donorId,
  };
}

export async function createDonation(
  _prevState: DonationActionState | null,
  formData: FormData,
): Promise<DonationActionState> {
  await requireUser();
  const values = readFormValues(formData);
  const parsed = parseDonationInput(toInputValues(values));

  if (!parsed.ok) {
    return actionError(values, null, parsed.fieldErrors);
  }

  try {
    const { donorId, error: donorError } = await resolveDonorId(
      parsed.data.donor_name,
    );
    if (donorError) {
      return { ...donorError, values };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("donations")
      .insert(donationWritePayload(parsed.data, donorId))
      .select("id")
      .single();

    if (error || !data) {
      return translateWriteError(values, error ?? {});
    }

    revalidatePath("/donations");
    redirect(`/donations/${data.id}?estado=creada`);
  } catch (error) {
    if (isNextControlFlowError(error)) {
      throw error;
    }

    return actionError(values, "No se pudo guardar. Intenta de nuevo.");
  }
}

export async function updateDonation(
  id: string,
  _prevState: DonationActionState | null,
  formData: FormData,
): Promise<DonationActionState> {
  await requireUser();
  const values = { ...readFormValues(formData), id };
  const parsed = parseDonationInput(toInputValues(values));

  if (!parsed.ok) {
    return actionError(values, null, parsed.fieldErrors);
  }

  if (!isDonationId(values.id)) {
    return actionError(values, "No se pudo guardar. Intenta de nuevo.");
  }

  try {
    const { donorId, error: donorError } = await resolveDonorId(
      parsed.data.donor_name,
    );
    if (donorError) {
      return { ...donorError, values };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("donations")
      .update(donationWritePayload(parsed.data, donorId))
      .eq("id", values.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return translateWriteError(values, error);
    }

    if (!data) {
      return actionError(values, "No se pudo guardar. Intenta de nuevo.");
    }

    revalidatePath("/donations");
    redirect(`/donations/${data.id}?estado=actualizada`);
  } catch (error) {
    if (isNextControlFlowError(error)) {
      throw error;
    }

    return actionError(values, "No se pudo guardar. Intenta de nuevo.");
  }
}

export async function deleteDonation(
  _prevState: DonationActionState | null,
  formData: FormData,
): Promise<DonationActionState> {
  await requireUser();
  const values = readFormValues(formData);

  if (!isDonationId(values.id)) {
    return actionError(values, "No se pudo eliminar. Intenta de nuevo.");
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("donations")
      .delete()
      .eq("id", values.id)
      .select("id");

    if (error) {
      const translated = translateWriteError(values, error);
      if (translated.formError === "No se pudo guardar. Intenta de nuevo.") {
        return actionError(values, "No se pudo eliminar. Intenta de nuevo.");
      }
      return translated;
    }

    if (!data?.length) {
      return actionError(values, "No se pudo eliminar. Intenta de nuevo.");
    }

    revalidatePath("/donations");
    redirect("/donations?estado=eliminada");
  } catch (error) {
    if (isNextControlFlowError(error)) {
      throw error;
    }

    return actionError(values, "No se pudo eliminar. Intenta de nuevo.");
  }
}
