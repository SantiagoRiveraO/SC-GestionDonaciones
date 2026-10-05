import { Card } from "@/components/ui/card";

export function DonationTotals({ title, total, moneyCount, suppliesCount, moneyLabels, filtered = false, emptyMessage = "Todavía no hay donaciones registradas." }: {
  title: string;
  total: number;
  moneyCount: number;
  suppliesCount: number;
  moneyLabels: string[];
  filtered?: boolean;
  emptyMessage?: string;
}) {
  return (
    <Card className="overflow-hidden" data-testid="donations-summary">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-zinc-200 px-4 py-3">
        <h2 className="text-[16px] font-medium text-ink-soft">{title}</h2>
        <p className="text-[20px] font-bold tabular-nums text-ink" aria-live="polite">{total.toLocaleString("es-VE")} {total === 1 ? "donación" : "donaciones"}</p>
      </div>
      {total === 0 ? <p className="p-4 text-ink-soft">{emptyMessage}</p> : (
        <dl className="divide-y divide-zinc-200 px-4 sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] sm:divide-x sm:divide-y-0">
          <div className="space-y-2 py-3 sm:pr-5">
            <dt className="flex flex-wrap items-baseline justify-between gap-x-3 text-ink">
              <span className="font-medium">Dinero recibido</span>
              <span className="text-[16px] text-ink-soft">{moneyCount.toLocaleString("es-VE")} {moneyCount === 1 ? "donación" : "donaciones"}</span>
            </dt>
            <dd className="min-w-0">
              {/* formatMoney produce "USD 1.250,50"; separar el código solo cambia la presentación. */}
              {moneyLabels.length ? <ul className="space-y-1">{moneyLabels.map((label) => <li key={label} className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-3"><span className="text-[16px] font-medium text-ink-soft">{label.slice(0, 3)}</span><span className="break-words text-right text-[22px] font-bold tabular-nums text-brand">{label.slice(4)}</span></li>)}</ul> : <span className="text-ink-soft">Sin aportes de dinero</span>}
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-3 sm:flex-col sm:justify-start sm:gap-y-2 sm:pl-5">
            <dt className="font-medium text-ink">Insumos</dt>
            <dd className="min-w-0 break-words text-[20px] font-bold tabular-nums text-ink">{suppliesCount.toLocaleString("es-VE")} {suppliesCount === 1 ? "donación" : "donaciones"}</dd>
          </div>
        </dl>
      )}
      {filtered && <p className="border-t border-zinc-200 bg-page px-4 py-2 text-[16px] text-ink-soft">Totales de las donaciones que coinciden con los filtros.</p>}
    </Card>
  );
}
