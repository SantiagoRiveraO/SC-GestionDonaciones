"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Check,
  Gift,
  Landmark,
  Send,
  Smartphone,
  Wallet,
} from "lucide-react";
import {
  createDonation,
  updateDonation,
  type DonationActionState,
} from "@/lib/donations/actions";
import { localTodayIsoDate } from "@/lib/donations/validation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import type { DonationListRow } from "@/types/database";
import type { DonationFieldErrors } from "@/lib/donations/validation";

const fieldClassName =
  "w-full min-h-[48px] rounded-lg border border-zinc-300 bg-surface px-3 text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

const choiceClassName =
  "flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-zinc-300 px-3 font-bold text-ink has-[:checked]:border-brand has-[:checked]:bg-brand-soft";

const DEFAULT_CURRENCIES = ["USD", "VES", "EUR"] as const;
const PRESET_METHODS = [
  "Efectivo",
  "Transferencia",
  "Pago móvil",
  "Zelle",
  "En especie",
] as const;

const FIELD_LABELS: Record<keyof DonationFieldErrors, string> = {
  amount: "Monto",
  currency: "Moneda",
  donated_at: "Fecha de la donación",
  method: "¿Cómo se recibió?",
  donor_name: "Donante",
  concept: "Concepto",
  notes: "Notas",
};

type DonationFormProps = {
  mode: "create" | "edit";
  donationId?: string;
  initial?: DonationListRow;
  donorNames: string[];
};

function AmountControl({
  id,
  defaultValue,
  currency,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
}: {
  id?: string;
  defaultValue?: string;
  currency: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}) {
  return (
    <div className="flex min-h-[48px] overflow-hidden rounded-lg border border-zinc-300 bg-surface focus-within:ring-[3px] focus-within:ring-brand">
      <span className="flex items-center bg-brand-soft px-3 font-bold text-brand">
        {currency}
      </span>
      <input
        id={id}
        name="amount"
        type="text"
        inputMode="decimal"
        defaultValue={defaultValue}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        className="min-h-[48px] min-w-0 flex-1 bg-transparent px-3 text-ink focus-visible:outline-none"
      />
    </div>
  );
}

function MethodChoiceIcon({ value }: { value: string }) {
  const iconClass = "size-5";

  switch (value) {
    case "Efectivo":
      return <Banknote aria-hidden className={iconClass} />;
    case "Transferencia":
      return <Landmark aria-hidden className={iconClass} />;
    case "Pago móvil":
      return <Smartphone aria-hidden className={iconClass} />;
    case "Zelle":
      return <Send aria-hidden className={iconClass} />;
    case "En especie":
      return <Gift aria-hidden className={iconClass} />;
    default:
      return <Wallet aria-hidden className={iconClass} />;
  }
}

function methodUiState(method: string) {
  if (PRESET_METHODS.includes(method as (typeof PRESET_METHODS)[number])) {
    return { choice: method, other: "" };
  }

  if (method) {
    return { choice: "Otro", other: method };
  }

  return { choice: "", other: "" };
}

function MethodFields({
  method,
  error,
}: {
  method: string;
  error?: string;
}) {
  const initial = methodUiState(method);
  const [choice, setChoice] = useState(initial.choice);
  const [other, setOther] = useState(initial.other);
  const errorId = error ? "method-error" : undefined;

  return (
    <div className="flex flex-col gap-3">
      <fieldset
        id="method"
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={errorId}
        className="flex flex-col gap-3"
      >
        <legend className="font-bold text-ink">¿Cómo se recibió?</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PRESET_METHODS.map((value) => (
            <label key={value} className={choiceClassName}>
              <input
                type="radio"
                name="method_choice"
                value={value}
                checked={choice === value}
                onChange={() => setChoice(value)}
                className="sr-only"
              />
              <MethodChoiceIcon value={value} />
              {value}
            </label>
          ))}
          <label className={choiceClassName}>
            <input
              type="radio"
              name="method_choice"
              value="Otro"
              checked={choice === "Otro"}
              onChange={() => setChoice("Otro")}
              className="sr-only"
            />
            <MethodChoiceIcon value="Otro" />
            Otro
          </label>
        </div>
      </fieldset>
      {choice === "Otro" ? (
        <Field id="method-other" label="Escribe el método" error={error}>
          <input
            name="method"
            type="text"
            value={other}
            onChange={(event) => setOther(event.target.value)}
            className={fieldClassName}
          />
        </Field>
      ) : (
        <input type="hidden" name="method" value={choice} />
      )}
      {choice !== "Otro" && error ? (
        <p id="method-error" className="font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function DonationFields({
  values,
  fieldErrors,
  donorNames,
}: {
  values: {
    amount: string;
    currency: string;
    donated_at: string;
    method: string;
    donor_name: string;
    concept: string;
    notes: string;
  };
  fieldErrors: DonationFieldErrors;
  donorNames: string[];
}) {
  const [currency, setCurrency] = useState(values.currency);
  const currencies = DEFAULT_CURRENCIES.includes(
    values.currency as (typeof DEFAULT_CURRENCIES)[number],
  )
    ? [...DEFAULT_CURRENCIES]
    : [...DEFAULT_CURRENCIES, values.currency];

  return (
    <>
      <Field
        id="amount"
        label="Monto"
        hint="Ejemplo: 25,50"
        error={fieldErrors.amount}
      >
        <AmountControl currency={currency} defaultValue={values.amount} />
      </Field>

      <fieldset
        id="currency"
        aria-invalid={Boolean(fieldErrors.currency) || undefined}
        aria-describedby={fieldErrors.currency ? "currency-error" : undefined}
        className="flex flex-col gap-3"
      >
        <legend className="font-bold text-ink">Moneda</legend>
        <div className="grid grid-cols-3 gap-3">
          {currencies.map((code) => (
            <label key={code} className={choiceClassName}>
              <input
                type="radio"
                name="currency"
                value={code}
                checked={currency === code}
                onChange={() => setCurrency(code)}
                className="sr-only"
              />
              {code}
            </label>
          ))}
        </div>
        {fieldErrors.currency ? (
          <p id="currency-error" className="font-medium text-red-700" role="alert">
            {fieldErrors.currency}
          </p>
        ) : null}
      </fieldset>

      <Field
        id="donated_at"
        label="Fecha de la donación"
        hint="Viene marcada la fecha de hoy."
        error={fieldErrors.donated_at}
      >
        <input
          type="date"
          name="donated_at"
          defaultValue={values.donated_at}
          className={fieldClassName}
        />
      </Field>

      <MethodFields method={values.method} error={fieldErrors.method} />

      <Field
        id="donor_name"
        label="Donante"
        optional
        hint="Si el nombre ya existe, se usa el mismo donante."
        error={fieldErrors.donor_name}
      >
        <input
          type="text"
          name="donor_name"
          list="donor-names"
          defaultValue={values.donor_name}
          className={fieldClassName}
        />
      </Field>
      <datalist id="donor-names">
        {donorNames.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      <Field id="concept" label="Concepto" optional error={fieldErrors.concept}>
        <input
          type="text"
          name="concept"
          defaultValue={values.concept}
          className={fieldClassName}
        />
      </Field>

      <Field id="notes" label="Notas" optional error={fieldErrors.notes}>
        <textarea
          name="notes"
          rows={4}
          defaultValue={values.notes}
          className={`${fieldClassName} py-3`}
        />
      </Field>
    </>
  );
}

export function DonationForm({
  mode,
  donationId,
  initial,
  donorNames,
}: DonationFormProps) {
  const router = useRouter();
  const summaryRef = useRef<HTMLDivElement>(null);
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
  const errorEntries = (
    Object.entries(fieldErrors) as Array<[keyof DonationFieldErrors, string]>
  ).filter(([, message]) => Boolean(message));
  const hasErrors = Boolean(state?.formError) || errorEntries.length > 0;

  useEffect(() => {
    if (hasErrors) {
      summaryRef.current?.focus();
    }
  }, [state, hasErrors]);

  return (
    <Card className="p-5">
      <form action={formAction} noValidate className="flex flex-col gap-5">
        {mode === "edit" ? (
          <input type="hidden" name="id" value={values.id} />
        ) : null}

        {hasErrors ? (
          <div ref={summaryRef} tabIndex={-1} className="outline-none">
            <Alert variant="error">
              <p className="font-bold">Revisa estos datos:</p>
              {state?.formError ? <p>{state.formError}</p> : null}
              {errorEntries.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {errorEntries.map(([field, message]) => (
                    <li key={field}>
                      <a href={`#${field}`} className="underline">
                        {FIELD_LABELS[field]}: {message}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Alert>
          </div>
        ) : null}

        <DonationFields
          key={[
            values.amount,
            values.currency,
            values.donated_at,
            values.method,
            values.donor_name,
            values.concept,
            values.notes,
          ].join("|")}
          values={values}
          fieldErrors={fieldErrors}
          donorNames={donorNames}
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            size="lg"
            icon={<Check aria-hidden className="size-5" />}
            loading={pending}
          >
            {pending ? "Guardando…" : "Guardar donación"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
