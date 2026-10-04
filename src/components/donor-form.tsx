"use client";

import { useActionState, useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { saveDonor } from "@/lib/donors/actions";
import type { Donor } from "@/types/database";
import type { DonorValues } from "@/lib/donors/validation";

const controlClass = "min-h-[48px] w-full rounded-lg border border-zinc-500 bg-surface px-3 text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";
const labels: Record<keyof DonorValues, string> = { full_name: "Nombre", phone: "Teléfono", email: "Correo electrónico", notes: "Notas" };

export function DonorForm({ initial }: { initial?: Pick<Donor, "id" | "full_name" | "phone" | "email" | "notes"> }) {
  const [state, action, pending] = useActionState(saveDonor.bind(null, initial?.id ?? null), null);
  const summary = useRef<HTMLDivElement>(null);
  const values = state?.values ?? { full_name: initial?.full_name ?? "", phone: initial?.phone ?? "", email: initial?.email ?? "", notes: initial?.notes ?? "" };
  const errors = state?.errors ?? {};
  const hasErrors = Boolean(state?.formError) || Object.keys(errors).length > 0;
  useEffect(() => { if (hasErrors) summary.current?.focus(); }, [state, hasErrors]);
  return (
    <Card className="p-5 sm:p-6">
      <form action={action} noValidate className="flex flex-col gap-5">
        {hasErrors ? (
          <div ref={summary} tabIndex={-1} className="outline-none">
            <Alert variant="error">
              <p className="font-bold">Revisa estos datos:</p>
              {state?.formError ? <p>{state.formError}</p> : null}
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {Object.entries(errors).map(([field, error]) => <li key={field}><a href={`#${field}`} className="underline">{labels[field as keyof DonorValues]}: {error}</a></li>)}
              </ul>
            </Alert>
          </div>
        ) : null}
        <div key={JSON.stringify(values)} className="flex flex-col gap-5">
          <Field id="full_name" label="Nombre del donante" hint="Puede ser una persona o una organización." error={errors.full_name}>
            <input name="full_name" type="text" autoComplete="name" defaultValue={values.full_name} maxLength={200} className={controlClass} />
          </Field>
          <Field id="phone" label="Teléfono" optional hint="Ejemplo: 0414 123 4567." error={errors.phone}>
            <input name="phone" type="tel" autoComplete="tel" defaultValue={values.phone} maxLength={40} className={controlClass} />
          </Field>
          <Field id="email" label="Correo electrónico" optional hint="Ejemplo: nombre@correo.com." error={errors.email}>
            <input name="email" type="email" autoComplete="email" defaultValue={values.email} maxLength={320} className={controlClass} />
          </Field>
          <Field id="notes" label="Notas" optional hint="Ejemplo: prefiere que lo contacten por teléfono." error={errors.notes}>
            <textarea name="notes" rows={3} defaultValue={values.notes} maxLength={2000} className={`${controlClass} py-3`} />
          </Field>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" size="lg" loading={pending} icon={<Check aria-hidden className="size-5" />}>{pending ? "Guardando…" : "Guardar donante"}</Button>
          <ButtonLink href={initial ? `/donors/${initial.id}` : "/donors"} variant="secondary" size="lg">Cancelar</ButtonLink>
        </div>
      </form>
    </Card>
  );
}
