"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  donationsListHref,
  hasActiveSearchFilters,
  type DonationSearchFilters,
} from "@/lib/donations/filters";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

type DonationFiltersProps = {
  filters: DonationSearchFilters;
  currencies: string[];
  methods: string[];
  summaryLine: string;
};

function optionsWithSelected(options: string[], selected: string | null) {
  if (!selected || options.includes(selected)) {
    return options;
  }

  return [...options, selected];
}

export function DonationFilters({
  filters,
  currencies,
  methods,
  summaryLine,
}: DonationFiltersProps) {
  const router = useRouter();
  const filtersRef = useRef(filters);
  const debounceRef = useRef<number | undefined>(undefined);
  const [query, setQuery] = useState(filters.q ?? "");
  const [prevQueryParam, setPrevQueryParam] = useState(filters.q);
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

  return (
    <section
      aria-label="Búsqueda y filtros"
      className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block space-y-1 text-sm sm:col-span-2 lg:col-span-1">
          <span className="font-medium text-zinc-900">Buscar</span>
          <input
            type="search"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Donante, concepto, método, notas…"
            className={`w-full rounded-md border border-zinc-300 bg-white px-3 py-2 ${focusRing}`}
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-zinc-900">Desde</span>
          <input
            type="date"
            value={filters.from ?? ""}
            onChange={(event) =>
              replaceFilters({
                ...filters,
                from: event.target.value || null,
              })
            }
            className={`w-full rounded-md border border-zinc-300 bg-white px-3 py-2 ${focusRing}`}
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-zinc-900">Hasta</span>
          <input
            type="date"
            value={filters.to ?? ""}
            onChange={(event) =>
              replaceFilters({
                ...filters,
                to: event.target.value || null,
              })
            }
            className={`w-full rounded-md border border-zinc-300 bg-white px-3 py-2 ${focusRing}`}
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-zinc-900">Moneda</span>
          <select
            value={filters.currency ?? ""}
            onChange={(event) =>
              replaceFilters({
                ...filters,
                currency: event.target.value || null,
              })
            }
            className={`w-full rounded-md border border-zinc-300 bg-white px-3 py-2 ${focusRing}`}
          >
            <option value="">Todas</option>
            {currencyOptions.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-zinc-900">Método</span>
          <select
            value={filters.method ?? ""}
            onChange={(event) =>
              replaceFilters({
                ...filters,
                method: event.target.value || null,
              })
            }
            className={`w-full rounded-md border border-zinc-300 bg-white px-3 py-2 ${focusRing}`}
          >
            <option value="">Todos</option>
            {methodOptions.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          className="text-sm text-zinc-700"
          aria-live="polite"
          data-testid="donations-summary"
        >
          {summaryLine}
        </p>
        {filtersActive ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setPrevQueryParam(null);
              startTransition(() => {
                router.replace("/donations");
              });
            }}
            className={`rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 ${focusRing}`}
          >
            Limpiar filtros
          </button>
        ) : null}
      </div>
    </section>
  );
}
