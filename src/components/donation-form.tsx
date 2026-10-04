"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  createDonation,
  updateDonation,
  type DonationActionState,
} from "@/lib/donations/actions";
import { localTodayIsoDate } from "@/lib/donations/validation";
import type { DonationListRow } from "@/types/database";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

const DEFAULT_CURRENCIES = ["USD", "VES", "EUR"];
const DEFAULT_METHODS = [
  "Efectivo",
  "Transferencia",
  "Pago móvil",
  "Zelle",
  "En especie",
];

type DonationFormProps = {
  mode: "create" | "edit";
  donationId?: string;
  initial?: DonationListRow;
  donorNames: string[];
  methods: string[];
};

function mergeOptions(defaults: string[], extra: string[], current?: string | null) {
  const options = [...defaults];

  for (const value of extra) {
    if (value && !options.includes(value)) {
      options.push(value);
    }
  }

  if (current && !options.includes(current)) {
    options.push(current);
  }

  return options;
}

function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="text-sm text-red-700">
      {message}
    </p>
  );
}

export function DonationForm({
  mode,
  donationId,
  initial,
  donorNames,
  methods,
}: DonationFormProps) {
  const router = useRouter();
  const action =
    mode === "create"
      ? createDonation
      : updateDonation.bind(null, donationId ?? "");
  const [state, formAction, pending] = useActionState<
    DonationActionState | null,
    FormData
  >(action, null);

  const values = state?.values ?? {
    id: donationId ?? "",
    amount: initial?.amount == null ? "" : String(initial.amount),
    currency: initial?.currency ?? "USD",
    donated_at: initial?.donated_at ?? localTodayIsoDate(),
    method: initial?.method ?? "",
    concept: initial?.concept ?? "",
    notes: initial?.notes ?? "",
    donor_name: initial?.donor_name ?? "",
  };
  const fieldErrors = state?.fieldErrors ?? {};
  const currencyOptions = mergeOptions(
    DEFAULT_CURRENCIES,
    [],
    values.currency,
  );
  const methodOptions = mergeOptions(DEFAULT_METHODS, methods, values.method);

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-lg border border-zinc-200 p-4"
    >
      {mode === "edit" ? (
        <input type="hidden" name="id" value={values.id} />
      ) : null}

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Donante (opcional)</span>
        <input
          type="text"
          id="donor_name"
          name="donor_name"
          list="donor-names"
          defaultValue={values.donor_name}
          aria-invalid={Boolean(fieldErrors.donor_name)}
          aria-describedby={
            fieldErrors.donor_name ? "donor_name-error" : undefined
          }
          className={`w-full rounded-md border border-zinc-300 px-3 py-2 ${focusRing}`}
        />
        <datalist id="donor-names">
          {donorNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <FieldError id="donor_name-error" message={fieldErrors.donor_name} />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Monto</span>
        <input
          type="number"
          id="amount"
          name="amount"
          min="0"
          step="0.01"
          required
          defaultValue={values.amount}
          aria-invalid={Boolean(fieldErrors.amount)}
          aria-describedby={fieldErrors.amount ? "amount-error" : undefined}
          className={`w-full rounded-md border border-zinc-300 px-3 py-2 ${focusRing}`}
          placeholder="0.00"
        />
        <FieldError id="amount-error" message={fieldErrors.amount} />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Moneda</span>
        {/* The key remounts the select: after a failed action React resets
            the form, and a select would fall back to its first default. */}
        <select
          key={values.currency}
          id="currency"
          name="currency"
          required
          defaultValue={values.currency}
          aria-invalid={Boolean(fieldErrors.currency)}
          aria-describedby={fieldErrors.currency ? "currency-error" : undefined}
          className={`w-full rounded-md border border-zinc-300 px-3 py-2 ${focusRing}`}
        >
          {currencyOptions.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <FieldError id="currency-error" message={fieldErrors.currency} />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Fecha de donación</span>
        <input
          type="date"
          id="donated_at"
          name="donated_at"
          required
          defaultValue={values.donated_at}
          aria-invalid={Boolean(fieldErrors.donated_at)}
          aria-describedby={
            fieldErrors.donated_at ? "donated_at-error" : undefined
          }
          className={`w-full rounded-md border border-zinc-300 px-3 py-2 ${focusRing}`}
        />
        <FieldError id="donated_at-error" message={fieldErrors.donated_at} />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Método</span>
        <input
          type="text"
          id="method"
          name="method"
          list="donation-methods"
          defaultValue={values.method}
          aria-invalid={Boolean(fieldErrors.method)}
          aria-describedby={fieldErrors.method ? "method-error" : undefined}
          className={`w-full rounded-md border border-zinc-300 px-3 py-2 ${focusRing}`}
          placeholder="Transferencia, efectivo…"
        />
        <datalist id="donation-methods">
          {methodOptions.map((method) => (
            <option key={method} value={method} />
          ))}
        </datalist>
        <FieldError id="method-error" message={fieldErrors.method} />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Concepto</span>
        <input
          type="text"
          id="concept"
          name="concept"
          defaultValue={values.concept}
          aria-invalid={Boolean(fieldErrors.concept)}
          aria-describedby={fieldErrors.concept ? "concept-error" : undefined}
          className={`w-full rounded-md border border-zinc-300 px-3 py-2 ${focusRing}`}
        />
        <FieldError id="concept-error" message={fieldErrors.concept} />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Notas</span>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={values.notes}
          aria-invalid={Boolean(fieldErrors.notes)}
          aria-describedby={fieldErrors.notes ? "notes-error" : undefined}
          className={`w-full rounded-md border border-zinc-300 px-3 py-2 ${focusRing}`}
        />
        <FieldError id="notes-error" message={fieldErrors.notes} />
      </label>

      {state?.formError ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.formError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {pending
            ? "Guardando…"
            : mode === "create"
              ? "Crear donación"
              : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() =>
            router.push(
              mode === "edit" && donationId
                ? `/donations/${donationId}`
                : "/donations",
            )
          }
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
