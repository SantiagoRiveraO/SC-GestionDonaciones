"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  getDonationsServerSnapshot,
  getDonationsSnapshot,
  subscribeDonations,
} from "@/lib/donations/prototype-store";
import type { Donation } from "@/types/database";

function formatAmount(donation: Donation) {
  return `${donation.amount.toFixed(2)} ${donation.currency}`;
}

export function DonationsList() {
  const donations = useSyncExternalStore(
    subscribeDonations,
    getDonationsSnapshot,
    getDonationsServerSnapshot,
  );

  if (donations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-600">
        No hay donaciones registradas todavía.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
          <tr>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Monto</th>
            <th className="px-4 py-3 font-medium">Concepto</th>
            <th className="px-4 py-3 font-medium">Método</th>
            <th className="px-4 py-3 font-medium">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {donations.map((donation) => (
            <tr
              key={donation.id}
              className="border-b border-zinc-100 last:border-0"
            >
              <td className="px-4 py-3 text-zinc-900">{donation.donated_at}</td>
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
                  className="font-medium text-zinc-900 hover:underline"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
