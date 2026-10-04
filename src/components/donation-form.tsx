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
import type { SupplyCategoryOption } from "@/lib/donations/categories";
import { AddCategoryControl } from "@/components/category-editor";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import type { DonationListRow } from "@/types/database";
import type { DonationFieldErrors } from "@/lib/donations/validation";

const fieldClassName =
  "w-full min-h-[48px] rounded-lg border border-zinc-300 bg-surface px-3 text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

const choiceClassName =
  "flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-zinc-300 px-3 font-bold text-ink has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-brand";

const DEFAULT_CURRENCIES = ["USD", "VES", "EUR"] as const;
const PRESET_METHODS = [
  "Efectivo",
  "Transferencia",
  "Pago móvil",
  "Zelle",
] as const;

const FIELD_LABELS: Record<keyof DonationFieldErrors, string> = {
  category: "Categoría",
  kind: "Tipo de donación",
  item_description: "¿Qué se recibió?",
  quantity: "Cantidad",
  unit: "¿Cómo se cuenta?",
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
  categories: SupplyCategoryOption[];
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
        <legend className="font-bold text-ink">
          ¿Cómo se recibió el dinero?{" "}
          <span className="font-normal text-ink-soft">(opcional)</span>
        </legend>
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

function CategoryFields({
  category,
  error,
  categories,
}: {
  category: string;
  error?: string;
  categories: SupplyCategoryOption[];
}) {
  const [selected, setSelected] = useState(category);
  const [added, setAdded] = useState<SupplyCategoryOption[]>([]);
  const [createdName, setCreatedName] = useState("");
  const options = [...categories, ...added.filter((option) => !categories.some((existing) => existing.value === option.value))];
  return (
    <fieldset
      id="category"
      className="space-y-3"
      aria-invalid={Boolean(error) || undefined}
      aria-describedby={error ? "category-error" : "category-hint"}
    >
      <legend className="font-bold text-ink">
        Categoría <span className="font-normal text-ink-soft">(opcional)</span>
      </legend>
      <p id="category-hint" className="text-ink-soft">Elige una opción para agrupar los insumos.</p>
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3">
        {options.map(({ value, label }) => (
          <label key={value} className={`${choiceClassName} min-h-[64px] justify-start py-3`}>
            <input
              type="radio"
              name="category_choice"
              value={value}
              checked={selected === value}
              onChange={() => setSelected(value)}
              className="size-5 shrink-0 accent-brand"
            />
            <span className="min-w-0 break-words">{label}</span>
          </label>
        ))}
      </div>
      <input type="hidden" name="category" value={selected} />
      {selected ? (
        <Button type="button" variant="secondary" onClick={() => setSelected("")}>
          Quitar categoría
        </Button>
      ) : null}
      <AddCategoryControl onCreated={(option) => {
        setAdded((current) => [...current, option]);
        setSelected(option.value);
        setCreatedName(option.label);
      }} />
      {createdName ? <p role="status" className="text-ink">Categoría agregada: {createdName}.</p> : null}
      {error ? (
        <p id="category-error" role="alert" className="text-red-700">{error}</p>
      ) : null}
    </fieldset>
  );
}

function DonationFields({
  values,
  fieldErrors,
  donorNames,
  categories,
}: {
  values: {
    category: string;
    kind: string;
    item_description: string;
    quantity: string;
    unit: string;
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
  categories: SupplyCategoryOption[];
}) {
  const [kind, setKind] = useState(values.kind);
  const initialCurrency = values.currency || "USD";
  const [currency, setCurrency] = useState(initialCurrency);
  const currencies = DEFAULT_CURRENCIES.includes(
    initialCurrency as (typeof DEFAULT_CURRENCIES)[number],
  )
    ? [...DEFAULT_CURRENCIES]
    : [...DEFAULT_CURRENCIES, initialCurrency];

  return (
    <>
      <fieldset
        id="kind"
        aria-invalid={Boolean(fieldErrors.kind) || undefined}
        aria-describedby={fieldErrors.kind ? "kind-error" : "kind-hint"}
        className="space-y-3"
      >
        <legend className="font-bold text-ink">Tipo de donación</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={`${choiceClassName} min-h-[72px]`}>
            <input
              type="radio"
              name="kind"
              value="money"
              checked={kind === "money"}
              onChange={() => setKind("money")}
              className="sr-only"
            />
            <Banknote aria-hidden className="size-6" /> Dinero
          </label>
          <label className={`${choiceClassName} min-h-[72px]`}>
            <input
              type="radio"
              name="kind"
              value="supplies"
              checked={kind === "supplies"}
              onChange={() => setKind("supplies")}
              className="sr-only"
            />
            <Gift aria-hidden className="size-6" /> Insumos
          </label>
        </div>
        <p id="kind-hint" className="text-ink-soft">
          {kind === "supplies"
            ? "Alimentos, medicinas, ropa u otros artículos. No necesitas indicar un monto de dinero."
            : "Registra el monto, la moneda y cómo se recibió el dinero."}
        </p>
        {fieldErrors.kind ? (
          <p id="kind-error" className="text-red-700" role="alert">{fieldErrors.kind}</p>
        ) : null}
      </fieldset>

      <div hidden={kind !== "money"}>
        <fieldset disabled={kind !== "money"} className="flex flex-col gap-5">
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
          <MethodFields method={values.method} error={fieldErrors.method} />
        </fieldset>
      </div>

      <div hidden={kind !== "supplies"}>
        <fieldset disabled={kind !== "supplies"} className="flex flex-col gap-5">
          <CategoryFields category={values.category} categories={categories} error={fieldErrors.category} />
          <Field
            id="item_description"
            label="¿Qué se recibió?"
            hint="Ejemplo: sacos de harina, ropa de bebé o pañales talla M."
            error={fieldErrors.item_description}
          >
            <input
              type="text"
              name="item_description"
              defaultValue={values.item_description}
              maxLength={200}
              className={fieldClassName}
            />
          </Field>
          <Field
            id="quantity"
            label="Cantidad"
            optional
            hint="Ejemplo: 10 o 2,50. Puedes dejarla vacía si no conoces la cantidad."
            error={fieldErrors.quantity}
          >
            <input
              type="text"
              name="quantity"
              inputMode="decimal"
              defaultValue={values.quantity}
              className={fieldClassName}
            />
          </Field>
          <Field
            id="unit"
            label="¿Cómo se cuenta?"
            optional
            hint="Si indicas una cantidad, escribe cómo se cuenta. Ejemplo: sacos, cajas, kg o unidades."
            error={fieldErrors.unit}
          >
            <input
              type="text"
              name="unit"
              list="supply-units"
              defaultValue={values.unit}
              maxLength={40}
              className={fieldClassName}
            />
          </Field>
          <datalist id="supply-units">
            {["sacos", "unidades", "kg", "litros", "cajas", "paquetes", "bolsas"].map((unit) => <option key={unit} value={unit} />)}
          </datalist>
        </fieldset>
      </div>

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
  categories,
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
    category: initial?.category ?? "",
    kind: initial?.kind ?? "money",
    item_description: initial?.item_description ?? "",
    quantity: initial?.quantity == null ? "" : String(initial.quantity),
    unit: initial?.unit ?? "",
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
            values.category,
            values.kind,
            values.item_description,
            values.quantity,
            values.unit,
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
          categories={categories}
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
      <div className="mt-5 border-t border-zinc-200 pt-5">
        <ButtonLink href="/donations/categories" variant="secondary">Administrar categorías</ButtonLink>
        <p className="mt-2 text-ink-soft">Guarda primero la donación si tienes cambios pendientes.</p>
      </div>
    </Card>
  );
}
