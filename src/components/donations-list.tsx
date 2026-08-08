"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSyncExternalStore } from "react";
import {
  EMPTY_FILTERS,
  filterDonations,
  formatSummaryLine,
  hasActiveFilters,
  summarizeDonations,
  uniqueCurrencies,
  uniqueMethods,
  type DonationFilters,
} from "@/lib/donations/filter-donations";
import {
  getDonationsServerSnapshot,
  getDonationsSnapshot,
  subscribeDonations,
} from "@/lib/donations/prototype-store";
import type { Donation } from "@/types/database";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

function formatAmount(donation: Donation) {
  return `${donation.amount.toFixed(2)} ${donation.currency}`;
}

export function DonationsList() {
  const donations = useSyncExternalStore(
    subscribeDonations,
    getDonationsSnapshot,
    getDonationsServerSnapshot,
  );
  const [filters, setFilters] = useState<DonationFilters>(EMPTY_FILTERS);

  const currencies = useMemo(() => uniqueCurrencies(donations), [donations]);
  const methods = useMemo(() => uniqueMethods(donations), [donations]);
  const filtered = useMemo(
    () => filterDonations(donations, filters),
    [donations, filters],
  );
  const summary = useMemo(() => summarizeDonations(filtered), [filtered]);
  const filtersActive = hasActiveFilters(filters);

  function updateFilter<K extends keyof DonationFilters>(
    key: K,
    value: DonationFilters[K],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="space-y-4">
      <section
        aria-label="Búsqueda y filtros"
        className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block space-y-1 text-sm sm:col-span-2 lg:col-span-1">
            <span className="font-medium text-zinc-900">Buscar</span>
            <input
              type="search"
              value={filters.query}
              onChange={(event) => updateFilter("query", event.target.value)}
              placeholder="Concepto, método, notas…"
              className={`w-full rounded-md border border-zinc-300 bg-white px-3 py-2 ${focusRing}`}
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-zinc-900">Desde</span>
            <input
              type="date"
              value={filters.from}
              onChange={(event) => updateFilter("from", event.target.value)}
              className={`w-full rounded-md border border-zinc-300 bg-white px-3 py-2 ${focusRing}`}
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-zinc-900">Hasta</span>
            <input
              type="date"
              value={filters.to}
              onChange={(event) => updateFilter("to", event.target.value)}
              className={`w-full rounded-md border border-zinc-300 bg-white px-3 py-2 ${focusRing}`}
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-zinc-900">Moneda</span>
            <select
              value={filters.currency}
              onChange={(event) => updateFilter("currency", event.target.value)}
              className={`w-full rounded-md border border-zinc-300 bg-white px-3 py-2 ${focusRing}`}
            >
              <option value="">Todas</option>
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-zinc-900">Método</span>
            <select
              value={filters.method}
              onChange={(event) => updateFilter("method", event.target.value)}
              className={`w-full rounded-md border border-zinc-300 bg-white px-3 py-2 ${focusRing}`}
            >
              <option value="">Todos</option>
              {methods.map((method) => (
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
            {formatSummaryLine(summary)}
          </p>
          {filtersActive ? (
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className={`rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 ${focusRing}`}
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>
      </section>

      {donations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-600">
          No hay donaciones registradas todavía.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-600">
          No hay resultados para los filtros aplicados.
        </div>
      ) : (
        <>
          <ul className="space-y-3 sm:hidden" aria-label="Listado de donaciones">
            {filtered.map((donation) => (
              <li
                key={donation.id}
                className="rounded-lg border border-zinc-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-900">
                      {formatAmount(donation)}
                    </p>
                    <p className="text-sm text-zinc-600">{donation.donated_at}</p>
                    <p className="text-sm text-zinc-600">
                      {donation.concept || "Sin concepto"}
                    </p>
                    {donation.method ? (
                      <p className="text-xs text-zinc-500">{donation.method}</p>
                    ) : null}
                  </div>
                  <Link
                    href={`/donations/${donation.id}`}
                    className={`shrink-0 text-sm font-medium text-zinc-900 underline-offset-2 hover:underline ${focusRing} rounded-sm`}
                  >
                    Ver
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-lg border border-zinc-200 sm:block">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">
                Donaciones filtradas ({summary.count})
              </caption>
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Fecha
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Monto
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Concepto
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Método
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((donation) => (
                  <tr
                    key={donation.id}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="px-4 py-3 text-zinc-900">
                      {donation.donated_at}
                    </td>
                    <td className="px-4 py-3 text-zinc-900">
                      {formatAmount(donation)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {donation.concept || "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {donation.method || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/donations/${donation.id}`}
                        className={`font-medium text-zinc-900 hover:underline ${focusRing} rounded-sm`}
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
