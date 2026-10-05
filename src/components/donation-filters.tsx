"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { parseSupplyCategory, type SupplyCategoryOption } from "@/lib/donations/categories";
import {
  donationsListHref,
  hasActiveSearchFilters,
  type DonationSearchFilters,
} from "@/lib/donations/filters";

const fieldClassName =
  "w-full min-h-[48px] rounded-lg border border-zinc-500 bg-surface px-3 text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

type DonationFiltersProps = {
  filters: DonationSearchFilters;
  currencies: string[];
  methods: string[];
  categories: SupplyCategoryOption[];
};

function optionsWithSelected(options: string[], selected: string | null) {
  if (!selected || options.includes(selected)) {
    return options;
  }

  return [...options, selected];
}

function hasAdvancedFilters(filters: DonationSearchFilters) {
  return Boolean(
    filters.category || filters.kind || filters.currency || filters.method || filters.from || filters.to,
  );
}

export function DonationFilters({
  filters,
  currencies,
  methods,
  categories,
}: DonationFiltersProps) {
  const router = useRouter();
  const [query, setQuery] = useState(filters.q ?? "");
  const [prevQueryParam, setPrevQueryParam] = useState(filters.q);
  const [filtersOpen, setFiltersOpen] = useState(hasAdvancedFilters(filters));
  const filtersActive = hasActiveSearchFilters(filters);
  const currencyOptions = optionsWithSelected(currencies, filters.currency);
  const methodOptions = optionsWithSelected(methods, filters.method);

  if (filters.q !== prevQueryParam) {
    setPrevQueryParam(filters.q);
    setQuery(filters.q ?? "");
  }

  function replaceFilters(next: DonationSearchFilters) {
    startTransition(() => {
      router.replace(donationsListHref({ ...next, q: query.trim() || null, page: 1 }));
    });
  }

  function clearFilters() {
    setQuery("");
    setPrevQueryParam(null);
    startTransition(() => {
      router.replace("/donations");
    });
  }

  return (
    <Card className="space-y-4 p-4">
      <form aria-label="Búsqueda y filtros" className="space-y-3" onSubmit={(event) => { event.preventDefault(); replaceFilters(filters); }}>
        <div className="space-y-1.5">
          <label htmlFor="donation-search" className="font-bold text-ink">
            Buscar donaciones
          </label>
          <div className="flex gap-2">
            <input
              id="donation-search"
              type="search"
              placeholder="Buscar…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={`${fieldClassName} min-w-0 flex-1`}
            />
            <Button type="submit" className="shrink-0 px-3">Buscar</Button>
          </div>
          <p className="text-[16px] text-ink-soft">Donante, insumo o concepto.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="ghost"
            className="px-0 underline"
            aria-expanded={filtersOpen}
            aria-controls="donation-advanced-filters"
            icon={
              filtersOpen ? (
                <ChevronUp aria-hidden className="size-5" />
              ) : (
                <ChevronDown aria-hidden className="size-5" />
              )
            }
            onClick={() => setFiltersOpen((open) => !open)}
          >
            {filtersOpen ? "Ocultar filtros" : "Más filtros"}
          </Button>
          {filtersActive ? (
            <Button type="button" variant="secondary" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          ) : null}
        </div>

        {filtersOpen ? (
          <div
            id="donation-advanced-filters"
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <Field id="filter-kind" label="Tipo de donación">
              <select
                value={filters.kind ?? ""}
                onChange={(event) => replaceFilters({
                  ...filters,
                  kind: event.target.value === "money" ? "money" : event.target.value === "supplies" ? "supplies" : null,
                  category: event.target.value === "money" ? null : filters.category,
                  currency: event.target.value === "supplies" ? null : filters.currency,
                  method: event.target.value === "supplies" ? null : filters.method,
                })}
                className={fieldClassName}
              >
                <option value="">Dinero e insumos</option>
                <option value="money">Dinero</option>
                <option value="supplies">Insumos</option>
              </select>
            </Field>
            <Field id="filter-category" label="Categoría de insumos">
              <select
                disabled={filters.kind === "money"}
                value={filters.category ?? ""}
                onChange={(event) => replaceFilters({
                  ...filters,
                  category: parseSupplyCategory(event.target.value),
                  kind: event.target.value ? "supplies" : filters.kind,
                  currency: event.target.value ? null : filters.currency,
                  method: event.target.value ? null : filters.method,
                })}
                className={fieldClassName}
              >
                <option value="">Todas</option>
                {categories.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <Field id="filter-from" label="Desde">
              <input
                type="date"
                value={filters.from ?? ""}
                onChange={(event) =>
                  replaceFilters({
                    ...filters,
                    from: event.target.value || null,
                  })
                }
                className={fieldClassName}
              />
            </Field>
            <Field id="filter-to" label="Hasta">
              <input
                type="date"
                value={filters.to ?? ""}
                onChange={(event) =>
                  replaceFilters({
                    ...filters,
                    to: event.target.value || null,
                  })
                }
                className={fieldClassName}
              />
            </Field>
            <Field id="filter-currency" label="Moneda del dinero">
              <select
                disabled={filters.kind === "supplies"}
                value={filters.currency ?? ""}
                onChange={(event) =>
                  replaceFilters({
                    ...filters,
                    currency: event.target.value || null,
                  })
                }
                className={fieldClassName}
              >
                <option value="">Todas</option>
                {currencyOptions.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="filter-method" label="Método de pago">
              <select
                disabled={filters.kind === "supplies"}
                value={filters.method ?? ""}
                onChange={(event) =>
                  replaceFilters({
                    ...filters,
                    method: event.target.value || null,
                  })
                }
                className={fieldClassName}
              >
                <option value="">Todos</option>
                {methodOptions.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        ) : null}
      </form>
    </Card>
  );
}
