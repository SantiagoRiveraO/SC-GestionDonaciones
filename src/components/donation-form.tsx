"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Banknote, Check, Gift } from "lucide-react";
import { createDonation, updateDonation, type DonationActionState } from "@/lib/donations/actions";
import { localTodayIsoDate, type DonationFieldErrors } from "@/lib/donations/validation";
import type { SupplyCategoryOption } from "@/lib/donations/categories";
import type { DonationListRow } from "@/types/database";
import type { DonorOption } from "@/lib/donors/selection";
import { AddCategoryControl } from "@/components/category-editor";
import { DonorPicker } from "@/components/donor-picker";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Disclosure } from "@/components/ui/disclosure";
import { Field } from "@/components/ui/field";

const control = "w-full min-w-0 min-h-[48px] rounded-lg border border-zinc-500 bg-surface px-3 text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";
const choice = "flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-zinc-400 px-3 font-bold text-ink has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-brand";
const PRESET_METHODS = ["Efectivo", "Transferencia", "Pago móvil", "Zelle"];
const FIELD_LABELS: Record<keyof DonationFieldErrors, string> = { category: "Categoría", kind: "Tipo de donación", item_description: "Insumos recibidos", quantity: "Cantidad", unit: "Unidad", amount: "Monto", currency: "Moneda", donated_at: "Fecha de la donación", method: "¿Cómo se recibió?", donor_id: "Donante", concept: "Concepto", notes: "Notas" };
type DonationFormProps = { mode: "create" | "edit"; donationId?: string; initial?: DonationListRow; categories: SupplyCategoryOption[]; selectedDonor?: DonorOption };

function MethodFields({ method, error }: { method: string; error?: string }) {
  const [selected, setSelected] = useState(PRESET_METHODS.includes(method) || !method ? method : "Otro");
  const [other, setOther] = useState(selected === "Otro" ? method : "");
  return <div className="space-y-3">
    <Field id="method" label="¿Cómo se recibió el dinero?" optional error={error}>
      <select value={selected} onChange={(event) => setSelected(event.target.value)} className={control}>
        <option value="">Sin indicar</option>
        {PRESET_METHODS.map((value) => <option key={value}>{value}</option>)}
        <option>Otro</option>
      </select>
    </Field>
    <input type="hidden" name="method" value={selected === "Otro" ? other : selected} />
    {selected === "Otro" && <Field id="method-other" label="Escribe el método"><input type="text" value={other} onChange={(event) => setOther(event.target.value)} maxLength={50} className={control} /></Field>}
  </div>;
}

function CategoryFields({ category, error, categories, onBusyChange }: { category: string; error?: string; categories: SupplyCategoryOption[]; onBusyChange: (busy: boolean) => void }) {
  const [selected, setSelected] = useState(category);
  const [added, setAdded] = useState<SupplyCategoryOption[]>([]);
  const [createdName, setCreatedName] = useState("");
  const options = [...categories, ...added.filter((option) => !categories.some((existing) => existing.value === option.value))];
  return <div id="category" className="space-y-2">
    <Field id="category-select" label="Categoría" optional error={error}>
      <select name="category" value={selected} onChange={(event) => setSelected(event.target.value)} className={control}>
        <option value="">Sin categoría</option>
        {options.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select>
    </Field>
    <AddCategoryControl onBusyChange={onBusyChange} onCreated={(option) => { setAdded((current) => [...current, option]); setSelected(option.value); setCreatedName(option.label); }} />
    <ButtonLink href="/donations/categories" variant="ghost" className="px-0 text-brand underline">Editar categorías</ButtonLink>
    {createdName && <p role="status" className="text-ink-soft">Categoría agregada: {createdName}.</p>}
  </div>;
}

type FormValues = Omit<DonationActionState["values"], "id">;
function DonationFields({ values, fieldErrors, selectedDonor, onBusyChange, onSelectionChange, onCategoryBusyChange, categories }: {
  values: FormValues; fieldErrors: DonationFieldErrors; selectedDonor?: DonorOption; onBusyChange: (busy: boolean) => void;
  onSelectionChange: (donor: DonorOption) => void; onCategoryBusyChange: (busy: boolean) => void; categories: SupplyCategoryOption[];
}) {
  const [kind, setKind] = useState(values.kind);
  const [currency, setCurrency] = useState(values.currency || "USD");
  const currencies = [...new Set(["USD", "VES", "EUR", values.currency].filter(Boolean))];
  const detailsOpen = Boolean(values.concept || values.notes || (kind === "money" && values.method) || fieldErrors.method || fieldErrors.concept || fieldErrors.notes);
  return <div className="space-y-5">
    <fieldset id="kind" className="space-y-2" aria-describedby={fieldErrors.kind ? "kind-error" : undefined}>
      <legend className="mb-2 font-bold text-ink">¿Qué se recibió?</legend>
      <div className="grid grid-cols-2 gap-3">
        {[{ value: "money", label: "Dinero", icon: Banknote }, { value: "supplies", label: "Insumos", icon: Gift }].map(({ value, label, icon: Icon }) => <label key={value} className={choice}>
          <input type="radio" name="kind" value={value} checked={kind === value} onChange={() => setKind(value)} className="sr-only" /><Icon aria-hidden className="hidden size-5 shrink-0 min-[360px]:block" />{label}
        </label>)}
      </div>
      {fieldErrors.kind && <p id="kind-error" role="alert" className="text-red-700">{fieldErrors.kind}</p>}
    </fieldset>
    <div hidden={kind !== "money"}>
      <fieldset disabled={kind !== "money"} className="grid grid-cols-[minmax(0,1fr)_100px] gap-3">
        <Field id="amount" label="Monto" hint="Ejemplo: 25,50" error={fieldErrors.amount}><input name="amount" type="text" inputMode="decimal" defaultValue={values.amount} className={control} /></Field>
        <Field id="currency" label="Moneda" error={fieldErrors.currency}><select name="currency" value={currency} onChange={(event) => setCurrency(event.target.value)} className={control}>{currencies.map((code) => <option key={code}>{code}</option>)}</select></Field>
      </fieldset>
    </div>
    <div hidden={kind !== "supplies"}>
      <fieldset disabled={kind !== "supplies"} className="space-y-4">
        <Field id="item_description" label="Insumos recibidos" hint="Ejemplo: sacos de harina o ropa." error={fieldErrors.item_description}><input name="item_description" type="text" defaultValue={values.item_description} maxLength={200} className={control} /></Field>
        <CategoryFields category={values.category} categories={categories} error={fieldErrors.category} onBusyChange={onCategoryBusyChange} />
        <div className="grid grid-cols-2 gap-3">
          <Field id="quantity" label="Cantidad" optional error={fieldErrors.quantity}><input name="quantity" type="text" inputMode="decimal" defaultValue={values.quantity} className={control} /></Field>
          <Field id="unit" label="Unidad" optional error={fieldErrors.unit}><input name="unit" type="text" list="supply-units" defaultValue={values.unit} maxLength={40} placeholder="sacos, kg…" className={control} /></Field>
        </div>
        <p className="text-[16px] text-ink-soft">Si no conoces la cantidad, deja ambos campos vacíos.</p>
        <datalist id="supply-units">{["sacos", "unidades", "kg", "litros", "cajas", "paquetes", "bolsas"].map((unit) => <option key={unit} value={unit} />)}</datalist>
      </fieldset>
    </div>
    <Field id="donated_at" label="Fecha de la donación" error={fieldErrors.donated_at}><input name="donated_at" type="date" min="2000-01-01" max={localTodayIsoDate()} defaultValue={values.donated_at} className={control} /></Field>
    <div className="border-t border-zinc-200 pt-4"><DonorPicker id={values.donor_id} name={values.donor_name} mode={values.donor_mode} initial={selectedDonor} error={fieldErrors.donor_id} onBusyChange={onBusyChange} onSelectionChange={onSelectionChange} /></div>
    <Disclosure title="Más detalles (opcional)" open={detailsOpen}>
      <div hidden={kind !== "money"}><fieldset disabled={kind !== "money"}><MethodFields method={values.method} error={fieldErrors.method} /></fieldset></div>
      <Field id="concept" label="Concepto" optional hint="Para qué se utilizará la donación." error={fieldErrors.concept}><input name="concept" type="text" defaultValue={values.concept} maxLength={200} className={control} /></Field>
      <Field id="notes" label="Notas" optional error={fieldErrors.notes}><textarea name="notes" rows={3} defaultValue={values.notes} maxLength={2000} className={`${control} py-3`} /></Field>
    </Disclosure>
  </div>;
}
export function DonationForm({
  mode,
  donationId,
  initial,
  categories,
  selectedDonor,
}: DonationFormProps) {
  const [donorBusy, setDonorBusy] = useState(false);
  const [categoryBusy, setCategoryBusy] = useState(false);
  const [chosenDonor, setChosenDonor] = useState(selectedDonor);
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
    donor_name: initial?.donor_name ?? selectedDonor?.full_name ?? "",
    donor_id: initial?.donor_id ?? selectedDonor?.id ?? "",
    donor_mode: initial && !initial.donor_id ? "anonymous" : "registered",
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
    <Card className="p-4 sm:p-6">
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

        <fieldset disabled={pending} className="contents">
        <DonationFields
          key={JSON.stringify(values)}
          values={values}
          fieldErrors={fieldErrors}
          selectedDonor={chosenDonor}
          onBusyChange={setDonorBusy}
          onSelectionChange={setChosenDonor}
          onCategoryBusyChange={setCategoryBusy}
          categories={categories}
        />
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            size="lg"
            className="min-w-0 flex-1 px-3"
            aria-label="Guardar donación"
            icon={<Check aria-hidden className="size-5" />}
            loading={pending}
            disabled={donorBusy || categoryBusy}
          >
            {pending ? "Guardando…" : <><span className="sm:hidden">Guardar</span><span className="hidden sm:inline">Guardar donación</span></>}
          </Button>
          <ButtonLink
            href={mode === "edit" ? `/donations/${donationId}` : "/donations"}
            variant="ghost"
            size="lg"
            className="px-3 text-brand underline"
            aria-disabled={pending || donorBusy || categoryBusy || undefined}
            onClick={(event) => { if (pending || donorBusy || categoryBusy) event.preventDefault(); }}
          >
            Cancelar
          </ButtonLink>
        </div>
      </form>

    </Card>
  );
}
