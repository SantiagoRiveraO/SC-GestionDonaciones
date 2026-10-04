import { parseSupplyCategory, type SupplyCategory } from "@/lib/donations/categories";
import { todayInCaracas } from "@/lib/format";

export type DonationInputValues = {
  category?: unknown;
  kind?: unknown;
  item_description?: unknown;
  quantity?: unknown;
  unit?: unknown;
  amount?: unknown;
  currency?: unknown;
  donated_at?: unknown;
  method?: unknown;
  concept?: unknown;
  notes?: unknown;
  donor_id?: unknown;
  donor_mode?: unknown;
};

export type DonationParsedInput = {
  category: SupplyCategory | null;
  kind: "money" | "supplies";
  item_description: string | null;
  quantity: number | null;
  unit: string | null;
  amount: number | null;
  currency: string | null;
  donated_at: string;
  method: string | null;
  concept: string | null;
  notes: string | null;
  donor_id: string | null;
};

export type DonationFieldErrors = Partial<{
  category: string;
  kind: string;
  item_description: string;
  quantity: string;
  unit: string;
  amount: string;
  currency: string;
  donated_at: string;
  method: string;
  concept: string;
  notes: string;
  donor_id: string;
}>;

export type ParseDonationResult =
  | { ok: true; data: DonationParsedInput }
  | { ok: false; fieldErrors: DonationFieldErrors };

const CURRENCY_PATTERN = /^[A-Za-z]{3}$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MIN_DONATED_AT = "2000-01-01";
const MAX_AMOUNT = 10_000_000_000;
const AMOUNT_ERROR = "Escribe el monto con números. Ejemplo: 25,50";

function isThousandGroups(parts: string[]) {
  return (
    parts.length > 1 &&
    /^\d{1,3}$/.test(parts[0] ?? "") &&
    parts.slice(1).every((part) => part.length === 3 && /^\d+$/.test(part))
  );
}

export function parseFlexibleAmount(raw: string): number | null {
  const trimmed = raw.trim();
  // Spaces may separate thousands, but must never silently join mistyped digits.
  if (/\s/.test(trimmed) && !/^\d{1,3}(?:[\s]\d{3})+(?:[.,]\d{1,2})?$/.test(trimmed)) return null;
  const cleaned = trimmed.replace(/\s/g, "");
  if (!cleaned || !/^[\d.,]+$/.test(cleaned) || !/\d/.test(cleaned)) {
    return null;
  }

  const commaCount = (cleaned.match(/,/g) ?? []).length;
  const periodCount = (cleaned.match(/\./g) ?? []).length;
  let normalized: string;

  if (commaCount > 0 && periodCount > 0) {
    const decimalIndex = Math.max(
      cleaned.lastIndexOf(","),
      cleaned.lastIndexOf("."),
    );
    const integerText = cleaned.slice(0, decimalIndex);
    const separator = cleaned[decimalIndex] === "," ? "." : ",";
    if (!isThousandGroups(integerText.split(separator))) return null;
    const integer = integerText.replace(/[.,]/g, "");
    const decimal = cleaned.slice(decimalIndex + 1);
    if (!/^\d+$/.test(integer) || !/^\d+$/.test(decimal)) {
      return null;
    }
    normalized = `${integer}.${decimal}`;
  } else if (commaCount > 0) {
    const parts = cleaned.split(",");
    if (parts.length === 2 && parts.every((part) => /^\d+$/.test(part))) {
      normalized = `${parts[0]}.${parts[1]}`;
    } else if (isThousandGroups(parts)) {
      normalized = parts.join("");
    } else {
      return null;
    }
  } else if (periodCount > 0) {
    const parts = cleaned.split(".");
    if (isThousandGroups(parts)) {
      normalized = parts.join("");
    } else if (parts.length === 2 && parts.every((part) => /^\d+$/.test(part))) {
      normalized = `${parts[0]}.${parts[1]}`;
    } else {
      return null;
    }
  } else if (/^\d+$/.test(cleaned)) {
    normalized = cleaned;
  } else {
    return null;
  }

  const decimal = normalized.includes(".") ? normalized.split(".")[1] ?? "" : "";
  if (decimal.length > 2) {
    return null;
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0 || amount >= MAX_AMOUNT) {
    return null;
  }

  return amount;
}

function asTrimmedString(value: unknown): string {
  if (value == null) {
    return "";
  }

  return String(value).trim();
}

function emptyToNull(value: string): string | null {
  return value === "" ? null : value;
}

export function localTodayIsoDate(now = new Date()): string {
  return todayInCaracas(now);
}

export function isDonationId(id: string): boolean {
  return UUID_PATTERN.test(id);
}

export function isValidIsoDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function parseDonationInput(
  values: DonationInputValues,
): ParseDonationResult {
  const fieldErrors: DonationFieldErrors = {};

  const amountText = asTrimmedString(values.amount);
  const currencyText = asTrimmedString(values.currency);
  const donatedAtText = asTrimmedString(values.donated_at);
  const methodText = asTrimmedString(values.method);
  const conceptText = asTrimmedString(values.concept);
  const notesText = asTrimmedString(values.notes);
  const donorIdText = asTrimmedString(values.donor_id);
  const donorMode = asTrimmedString(values.donor_mode) || "registered";
  const kindText = asTrimmedString(values.kind) || "money";
  const kind = kindText === "supplies" ? "supplies" : "money";
  const itemText = asTrimmedString(values.item_description);
  const quantityText = asTrimmedString(values.quantity);
  const unitText = asTrimmedString(values.unit);
  const categoryText = asTrimmedString(values.category);
  const category = kind === "supplies" ? parseSupplyCategory(categoryText) : null;

  if (kindText !== "money" && kindText !== "supplies") {
    fieldErrors.kind = "Elige si recibiste dinero o insumos.";
  }

  let amount: number | null = null;
  let quantity: number | null = null;
  if (kind === "money") {
    amount = parseFlexibleAmount(amountText);
    if (amount == null) fieldErrors.amount = AMOUNT_ERROR;
    if (!CURRENCY_PATTERN.test(currencyText)) {
      fieldErrors.currency = "Ingresa una moneda de 3 letras.";
    }
    if (methodText.toLowerCase() === "en especie") {
      fieldErrors.method = "Para registrar insumos, elige Insumos arriba.";
    }
  } else {
    if (categoryText && !category) {
      fieldErrors.category = "Elige una de las categorías disponibles.";
    }
    if (!itemText) {
      fieldErrors.item_description = "Describe los insumos recibidos. Ejemplo: arroz o pañales.";
    } else if (itemText.length > 200) {
      fieldErrors.item_description = "Máximo 200 caracteres.";
    }
    if (quantityText || unitText) {
      quantity = parseFlexibleAmount(quantityText);
      if (quantity == null || quantity <= 0) {
        fieldErrors.quantity = "Escribe una cantidad mayor que cero. Ejemplo: 10 o 2,50.";
      }
      if (!unitText) {
        fieldErrors.unit = "Escribe cómo se cuenta. Ejemplo: sacos, cajas o kg.";
      } else if (unitText.length > 40) {
        fieldErrors.unit = "Máximo 40 caracteres.";
      }
    }
  }

  if (!isValidIsoDate(donatedAtText)) {
    fieldErrors.donated_at = "Ingresa una fecha válida.";
  } else if (donatedAtText < MIN_DONATED_AT) {
    fieldErrors.donated_at = "La fecha no puede ser anterior al 2000.";
  } else if (donatedAtText > localTodayIsoDate()) {
    fieldErrors.donated_at = "La fecha no puede ser futura. Revisa el día.";
  }

  if (kind === "money" && methodText.length > 50) {
    fieldErrors.method = "Máximo 50 caracteres.";
  }

  if (conceptText.length > 200) {
    fieldErrors.concept = "Máximo 200 caracteres.";
  }

  if (notesText.length > 2000) {
    fieldErrors.notes = "Máximo 2000 caracteres.";
  }

  if (donorMode !== "registered" && donorMode !== "anonymous") fieldErrors.donor_id = "Elige un donante o marca Sin donante identificado.";
  else if (donorMode === "registered" && !isDonationId(donorIdText)) fieldErrors.donor_id = "Busca y selecciona un donante. Si no se conoce, marca Sin donante identificado.";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      category,
      kind,
      item_description: kind === "supplies" ? itemText : null,
      quantity,
      unit: kind === "supplies" ? emptyToNull(unitText) : null,
      amount,
      currency: kind === "money" ? currencyText.toUpperCase() : null,
      donated_at: donatedAtText,
      method: kind === "money" ? emptyToNull(methodText) : null,
      concept: emptyToNull(conceptText),
      notes: emptyToNull(notesText),
      donor_id: donorMode === "anonymous" ? null : donorIdText,
    },
  };
}
