export type DonationInputValues = {
  amount?: unknown;
  currency?: unknown;
  donated_at?: unknown;
  method?: unknown;
  concept?: unknown;
  notes?: unknown;
  donor_name?: unknown;
};

export type DonationParsedInput = {
  amount: number;
  currency: string;
  donated_at: string;
  method: string | null;
  concept: string | null;
  notes: string | null;
  donor_name: string | null;
};

export type DonationFieldErrors = Partial<{
  amount: string;
  currency: string;
  donated_at: string;
  method: string;
  concept: string;
  notes: string;
  donor_name: string;
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
    /^\d+$/.test(parts[0] ?? "") &&
    parts.slice(1).every((part) => part.length === 3 && /^\d+$/.test(part))
  );
}

export function parseFlexibleAmount(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "");
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
    const integer = cleaned.slice(0, decimalIndex).replace(/[.,]/g, "");
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
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  const donorNameText = asTrimmedString(values.donor_name);

  let amount = 0;
  const parsedAmount = parseFlexibleAmount(amountText);
  if (parsedAmount == null) {
    fieldErrors.amount = AMOUNT_ERROR;
  } else {
    amount = parsedAmount;
  }

  if (!CURRENCY_PATTERN.test(currencyText)) {
    fieldErrors.currency = "Ingresa una moneda de 3 letras.";
  }

  if (!isValidIsoDate(donatedAtText)) {
    fieldErrors.donated_at = "Ingresa una fecha válida.";
  } else if (donatedAtText < MIN_DONATED_AT) {
    fieldErrors.donated_at = "La fecha no puede ser anterior al 2000.";
  } else if (donatedAtText > localTodayIsoDate()) {
    fieldErrors.donated_at = "La fecha no puede ser futura. Revisa el día.";
  }

  if (methodText.length > 50) {
    fieldErrors.method = "Máximo 50 caracteres.";
  }

  if (conceptText.length > 200) {
    fieldErrors.concept = "Máximo 200 caracteres.";
  }

  if (notesText.length > 2000) {
    fieldErrors.notes = "Máximo 2000 caracteres.";
  }

  if (donorNameText.length > 200) {
    fieldErrors.donor_name = "Máximo 200 caracteres.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      amount,
      currency: currencyText.toUpperCase(),
      donated_at: donatedAtText,
      method: emptyToNull(methodText),
      concept: emptyToNull(conceptText),
      notes: emptyToNull(notesText),
      donor_name: emptyToNull(donorNameText),
    },
  };
}
