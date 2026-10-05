import { ChartNoAxesCombined } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button, ButtonLink } from "@/components/ui/button";
import { RankingBars } from "@/components/ranking-bars";
import { getDashboard } from "@/lib/dashboard/queries";
import { dashboardFilters } from "@/lib/dashboard/presentation";
import { donorMoneyLabels } from "@/lib/donors/presentation";

const chartCount = (value: number) => value.toLocaleString("es-VE");
const chartMoney = (value: number) => value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const control = "min-h-[48px] w-full rounded-md border border-zinc-500 bg-surface px-3 py-2 text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

export default async function SummaryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = dashboardFilters(await searchParams);
  const data = await getDashboard(filters.currency);
  const currencies = [...new Set(["USD", "VES", "EUR", ...Object.keys(data.moneyTotals as object), filters.currency])].sort();
  const moneyLabels = donorMoneyLabels(data.moneyTotals);
  return <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
    <PageHeader title="Resumen" description="Una mirada a todas las donaciones registradas." />
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {[{ label: "En total", value: data.total }, { label: "Dinero", value: data.moneyCount }, { label: "Insumos", value: data.suppliesCount }].map((item) => <Card key={item.label} className="space-y-1 p-3 sm:p-5"><p className="text-[16px] text-ink-soft sm:text-base">{item.label}</p><p className="text-[28px] font-bold text-ink">{item.value}</p></Card>)}
    </div>
    {data.total === 0 && <Card className="space-y-3 p-6"><ChartNoAxesCombined aria-hidden className="size-8 text-brand" /><p className="font-bold text-ink">El resumen aparecerá al registrar las primeras donaciones.</p><ButtonLink href="/donations/new">Registrar una donación</ButtonLink></Card>}
    <Card className="space-y-4 p-5 sm:p-6">
      <h2 className="text-xl font-bold text-ink">Donantes que más dinero han aportado</h2>
      <form action="/summary" className="grid items-end gap-4 sm:grid-cols-[1fr_auto]" aria-label="Elegir moneda del top de donantes">
        <div className="space-y-2"><label htmlFor="summary-currency" className="block font-bold text-ink">Moneda del top</label><select id="summary-currency" name="moneda" defaultValue={filters.currency} className={control}>{currencies.map((currency) => <option key={currency}>{currency}</option>)}</select></div>
        <Button type="submit" variant="secondary">Ver top</Button>
      </form>
      <p className="text-ink-soft">Los 5 donantes con mayor monto total aportado en {filters.currency}, de mayor a menor. Se suman todas sus donaciones de dinero en esta moneda.</p>
      <RankingBars rows={data.donors} axisLabel={`Total aportado (${filters.currency})`} unitLabel={filters.currency} integer={false} valueLabel={chartMoney} empty={`Todavía no hay donaciones de dinero en ${filters.currency} con donante identificado.`} />
    </Card>
    <Card className="space-y-3 p-5 sm:p-6"><h2 className="text-xl font-bold text-ink">Dinero recibido</h2><p className="text-ink-soft">Total por moneda, sin conversiones.</p>{moneyLabels.length ? <ul className="flex flex-wrap gap-3">{moneyLabels.map((label) => <li key={label} className="rounded-md bg-brand-soft px-4 py-3 text-xl font-bold text-brand">{label}</li>)}</ul> : <p className="text-ink-soft">Todavía no hay donaciones de dinero.</p>}</Card>
    {data.total > 0 && <Card className="space-y-4 p-5 sm:p-6"><h2 className="text-xl font-bold text-ink">Tipos de donaciones registradas</h2><p className="text-ink-soft">Cantidad de registros de cada tipo.</p><RankingBars rows={[{ label: "Dinero", value: data.moneyCount }, { label: "Insumos", value: data.suppliesCount }]} valueLabel={chartCount} /></Card>}
    <div className="grid items-start gap-6 md:grid-cols-2">
      <Card className="space-y-4 p-5 sm:p-6"><h2 className="text-xl font-bold text-ink">Insumos más donados</h2><p className="text-ink-soft">Los 5 insumos que se han recibido más veces, según su descripción y categoría. No se suman sacos, kilos ni unidades distintas.</p><RankingBars rows={data.items} valueLabel={chartCount} empty="Todavía no hay donaciones de insumos." /></Card>
      <Card className="space-y-4 p-5 sm:p-6"><h2 className="text-xl font-bold text-ink">Categorías más donadas</h2><p className="text-ink-soft">Cantidad de donaciones de insumos en cada categoría. Se muestran las 5 primeras.</p><RankingBars rows={data.categories} valueLabel={chartCount} empty="Todavía no hay donaciones de insumos." /></Card>
    </div>
  </main>;
}
