import Link from "next/link";
import { formatDate, formatMoney } from "@/lib/format";
import type { DonationListRow } from "@/types/database";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

type DonationsTableProps = {
  rows: DonationListRow[];
  total: number;
};

function donationAmount(donation: DonationListRow) {
  if (donation.amount == null || !donation.currency) {
    return "—";
  }

  return formatMoney(donation.amount, donation.currency);
}

function donationDate(donation: DonationListRow) {
  return donation.donated_at ? formatDate(donation.donated_at) : "—";
}

export function DonationsTable({ rows, total }: DonationsTableProps) {
  return (
    <>
      <ul className="space-y-3 sm:hidden" aria-label="Listado de donaciones">
        {rows.map((donation, index) => (
          <li
            key={donation.id ?? `donation-${index}`}
            className="rounded-lg border border-zinc-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-900">
                  {donationAmount(donation)}
                </p>
                <p className="text-sm text-zinc-600">{donationDate(donation)}</p>
                <p className="text-sm text-zinc-600">
                  {donation.donor_name || "—"}
                </p>
                <p className="text-sm text-zinc-600">
                  {donation.concept || "Sin concepto"}
                </p>
                {donation.method ? (
                  <p className="text-xs text-zinc-500">{donation.method}</p>
                ) : null}
              </div>
              {donation.id ? (
                <Link
                  href={`/donations/${donation.id}`}
                  className={`shrink-0 text-sm font-medium text-zinc-900 underline-offset-2 hover:underline ${focusRing} rounded-sm`}
                >
                  Ver
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-lg border border-zinc-200 sm:block">
        <table className="min-w-full text-left text-sm">
          <caption className="sr-only">
            Donaciones filtradas ({total})
          </caption>
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Fecha
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Donante
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
            {rows.map((donation, index) => (
              <tr
                key={donation.id ?? `donation-${index}`}
                className="border-b border-zinc-100 last:border-0"
              >
                <td className="px-4 py-3 text-zinc-900">
                  {donationDate(donation)}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {donation.donor_name || "—"}
                </td>
                <td className="px-4 py-3 text-zinc-900">
                  {donationAmount(donation)}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {donation.concept || "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {donation.method || "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {donation.id ? (
                    <Link
                      href={`/donations/${donation.id}`}
                      className={`font-medium text-zinc-900 hover:underline ${focusRing} rounded-sm`}
                    >
                      Ver
                    </Link>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
