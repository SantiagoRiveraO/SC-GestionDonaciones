"use client";

import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import {
  donationsListHref,
  hasActiveSearchFilters,
  type DonationSearchFilters,
} from "@/lib/donations/filters";

const fieldClassName =
  "w-full min-h-[48px] rounded-lg border border-zinc-300 bg-surface px-3 text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

type DonationFiltersProps = {
  filters: DonationSearchFilters;
  currencies: string[];
  methods: string[];
};

function optionsWithSelected(options: string[], selected: string | null) {
  if (!selected || options.includes(selected)) {
    return options;
  }

  return [...options, selected];
}

function hasAdvancedFilters(filters: DonationSearchFilters) {
  return Boolean(
    filters.currency || filters.method || filters.from || filters.to,
  );
}

export function DonationFilters({
  filters,
  currencies,
  methods,
}: DonationFiltersProps) {
  const router = useRouter();
  const filtersRef = useRef(filters);
  const debounceRef = useRef<number | undefined>(undefined);
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

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    return () => window.clearTimeout(debounceRef.current);
  }, []);

  function replaceFilters(next: DonationSearchFilters) {
    startTransition(() => {
      router.replace(donationsListHref({ ...next, page: 1 }));
    });
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      debounceRef.current = undefined;
      const nextQuery = value.trim() === "" ? null : value.trim();
      if (nextQuery === filtersRef.current.q) {
        return;
      }

      replaceFilters({ ...filtersRef.current, q: nextQuery });
    }, 300);
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
      <section aria-label="Búsqueda y filtros" className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="donation-search" className="font-bold text-ink">
            Buscar por donante, concepto o método
          </label>
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-soft"
            />
            <input
              id="donation-search"
              type="search"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              className={`${fieldClassName} pl-11`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            variant="secondary"
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
            <Field id="filter-currency" label="Moneda">
              <select
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
            <Field id="filter-method" label="Método">
              <select
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
      </section>
    </Card>
  );
}
