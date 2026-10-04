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

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;
const CURRENCY_PATTERN = /^[A-Za-z]{3}$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MIN_DONATED_AT = "2000-01-01";
const MAX_AMOUNT = 10_000_000_000;

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
  if (!AMOUNT_PATTERN.test(amountText)) {
    fieldErrors.amount = "Ingresa un monto válido.";
  } else {
    amount = Number(amountText);
    if (!Number.isFinite(amount) || amount < 0 || amount >= MAX_AMOUNT) {
      fieldErrors.amount = "Ingresa un monto válido.";
    }
  }

  if (!CURRENCY_PATTERN.test(currencyText)) {
    fieldErrors.currency = "Ingresa una moneda de 3 letras.";
  }

  if (!isValidIsoDate(donatedAtText)) {
    fieldErrors.donated_at = "Ingresa una fecha válida.";
  } else if (donatedAtText < MIN_DONATED_AT) {
    fieldErrors.donated_at = "La fecha no puede ser anterior al 2000.";
  } else if (donatedAtText > localTodayIsoDate()) {
    fieldErrors.donated_at = "La fecha no puede ser futura.";
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
