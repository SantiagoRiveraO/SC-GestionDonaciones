import Link from "next/link";
import { barWidth, type RankingRow } from "@/lib/dashboard/presentation";

export function RankingBars({ rows, valueLabel, empty = "Todavía no hay aportes registrados." }: {
  rows: RankingRow[]; valueLabel: (value: number) => string; empty?: string;
}) {
  const maximum = Math.max(0, ...rows.map((row) => row.value));
  if (rows.length === 0) return <p className="text-ink-soft">{empty}</p>;
  return <ol className="space-y-5">{rows.map((row, index) => <li key={row.id ?? `${row.label}-${row.detail}`} className="space-y-2">
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <div className="min-w-0">
        {row.id ? <Link href={`/donors/${row.id}`} className="inline-flex min-h-[48px] items-center break-words font-bold text-brand underline underline-offset-4 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand">{index + 1}. {row.label}</Link>
          : <p className="break-words font-bold text-ink">{index + 1}. {row.label}</p>}
        {row.detail && <p className="text-ink-soft">{row.detail}</p>}
      </div>
      <p className="font-bold text-ink">{valueLabel(row.value)}</p>
    </div>
    <div aria-hidden="true" className="h-5 overflow-hidden rounded-md bg-zinc-200"><div className="h-full rounded-md bg-brand" style={{ width: `${barWidth(row.value, maximum)}%` }} /></div>
  </li>)}</ol>;
}
