import Link from "next/link";
import { barWidth, chartScale, type RankingRow } from "@/lib/dashboard/presentation";

const tickFormat = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 });

export function RankingBars({
  rows, valueLabel, axisLabel = "Cantidad de donaciones", unitLabel = "donaciones", integer = true,
  empty = "Todavía no hay aportes registrados.",
}: {
  rows: RankingRow[]; valueLabel: (value: number) => string;
  axisLabel?: string; unitLabel?: string; integer?: boolean; empty?: string;
}) {
  if (rows.length === 0) return <p className="text-ink-soft">{empty}</p>;
  const scale = chartScale(rows.map((row) => row.value), integer);
  const units = scale.maximum >= 1e9 ? { divisor: 1e9, label: "Miles de millones de" }
    : scale.maximum >= 1e6 ? { divisor: 1e6, label: "Millones de" }
    : scale.maximum >= 1000 ? { divisor: 1000, label: "Miles de" }
    : { divisor: 1, label: "" };

  return (
    <figure className="space-y-3" aria-label={`Gráfico de barras. ${axisLabel}.`}>
      <figcaption className="text-base font-bold text-ink">{axisLabel}</figcaption>
      <p className="sr-only">Las barras parten de cero y comparten la misma escala. Una barra más larga representa un aporte mayor.</p>
      <div className="relative">
        {/* Las líneas recorren toda la zona de trazado, compartida por las filas. */}
        <div aria-hidden="true" className="pointer-events-none absolute top-0 right-0 bottom-11 w-[56%] border-l-2 border-zinc-500 sm:w-[65%]">
          <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-zinc-300" />
          <div className="absolute inset-y-0 right-0 border-l border-dashed border-zinc-300" />
        </div>
        <ol className="relative">
          {rows.map((row, index) => (
            <li key={row.id ?? `${row.label}-${row.detail}`} className="grid min-h-[100px] grid-cols-[44%_56%] items-center sm:grid-cols-[35%_65%]">
              <div className="min-w-0 py-3 pr-4">
                {row.id ? (
                  <Link href={`/donors/${row.id}`} className="inline-flex min-h-[48px] items-center break-words text-[17px] leading-snug font-bold text-brand underline underline-offset-4 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand">
                    {index + 1}. {row.label}
                  </Link>
                ) : (
                  <p className="break-words text-[17px] leading-snug font-bold text-ink">{row.label}</p>
                )}
                {row.detail && <p className="break-words text-[15px] leading-snug text-ink-soft">{row.detail}</p>}
                <p className="mt-1 break-words text-base font-bold text-ink">{valueLabel(row.value)}</p>
              </div>
              <div aria-hidden="true" className="pl-[2px]">
                <div className="h-9 rounded-r-[2px] bg-brand" style={{ width: `${barWidth(row.value, scale.maximum)}%` }} />
              </div>
            </li>
          ))}
        </ol>
        <div aria-hidden="true" className="ml-[44%] h-11 border-t-2 border-zinc-500 sm:ml-[35%]">
          <div className="relative pt-2 text-[15px] leading-normal tabular-nums text-ink-soft">
            {scale.ticks.map((tick, index) => (
              <span key={tick} className={`absolute ${index === 0 ? "left-0" : index === 1 ? "left-1/2 -translate-x-1/2" : "right-0"}`}>{tickFormat.format(tick / units.divisor)}</span>
            ))}
          </div>
        </div>
      </div>
      {units.divisor > 1 && <p className="text-right text-[15px] text-ink-soft">{units.label} {unitLabel}. Los valores junto a los nombres son exactos.</p>}
    </figure>
  );
}
