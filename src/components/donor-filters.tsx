"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { DONOR_SORTS, donorsHref, type DonorFilters, type DonorSort } from "@/lib/donors/filters";

const controlClass = "min-h-[48px] w-full rounded-lg border border-zinc-500 bg-surface px-3 text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

export function DonorFiltersControl({ filters, currencies }: { filters: DonorFilters; currencies: string[] }) {
  const router = useRouter();
  const [query, setQuery] = useState(filters.q);
  function apply(next: Partial<DonorFilters>) { router.replace(donorsHref({ ...filters, q: query, ...next, page: 1 })); }
  return (
    <Card className="p-5 sm:p-6">
      <form onSubmit={(event) => { event.preventDefault(); apply({}); }} className="space-y-4" aria-label="Buscar y ordenar donantes">
        <Field id="donor-search" label="Buscar por nombre, teléfono o correo">
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className={controlClass} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="donor-sort" label="Ordenar por">
            <select value={filters.sort} onChange={(event) => apply({ sort: event.target.value as DonorSort })} className={controlClass}>
              {DONOR_SORTS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </Field>
          {filters.sort === "money" ? <Field id="donor-currency" label="Moneda del aporte">
            <select value={filters.currency} onChange={(event) => apply({ currency: event.target.value })} className={controlClass}>
              {currencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
            </select>
          </Field> : null}
        </div>
        <p className="text-ink-soft">{filters.sort === "money" ? "Compara solo el dinero de la moneda elegida. Los insumos se cuentan aparte." : "Más donaciones cuenta los aportes de dinero y de insumos."}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" icon={<Search aria-hidden className="size-5" />}>Buscar</Button>
          {filters.q ? <ButtonLink href={donorsHref({ ...filters, q: "", page: 1 })} variant="secondary">Limpiar búsqueda</ButtonLink> : null}
        </div>
      </form>
    </Card>
  );
}
