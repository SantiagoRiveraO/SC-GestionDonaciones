import { ChartNoAxesCombined } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button, ButtonLink } from "@/components/ui/button";
import { RankingBars } from "@/components/ranking-bars";
import { getDashboard } from "@/lib/dashboard/queries";
import { dashboardFilters } from "@/lib/dashboard/presentation";
import { donorMoneyLabels } from "@/lib/donors/presentation";

const countLabel = (value: number) => `${value} ${value === 1 ? "donación" : "donaciones"}`;
const chartCount = (value: number) => value.toLocaleString("es-VE");
const chartMoney = (value: number) => value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const control = "min-h-[48px] w-full rounded-md border border-zinc-500 bg-surface px-3 py-2 text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

export default async function SummaryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = dashboardFilters(await searchParams);
  const data = await getDashboard(filters.kind, filters.currency);
  const currencies = [...new Set(["USD", "VES", "EUR", ...Object.keys(data.moneyTotals as object), filters.currency])].sort();
  const moneyLabels = donorMoneyLabels(data.moneyTotals);
  return <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
    <PageHeader title="Resumen" description="Una mirada a todas las donaciones registradas." actions={<ButtonLink href="/" variant="secondary">Volver al inicio</ButtonLink>} />
    <div className="grid gap-4 sm:grid-cols-3">
      {[{ label: "Donaciones en total", value: data.total }, { label: "De dinero", value: data.moneyCount }, { label: "De insumos", value: data.suppliesCount }].map((item) => <Card key={item.label} className="space-y-2 p-5"><p className="text-ink-soft">{item.label}</p><p className="text-[30px] font-bold text-ink">{item.value}</p></Card>)}
    </div>
    {data.total === 0 && <Card className="space-y-3 p-6"><ChartNoAxesCombined aria-hidden className="size-8 text-brand" /><p className="font-bold text-ink">El resumen aparecerá al registrar las primeras donaciones.</p><ButtonLink href="/donations/new">Registrar una donación</ButtonLink></Card>}
    <Card className="space-y-4 p-5 sm:p-6">
      <h2 className="text-xl font-bold text-ink">Donantes con más aportes</h2>
      <form action="/summary" className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]" aria-label="Elegir comparación de donantes">
        <div className="space-y-2"><label htmlFor="summary-kind" className="block font-bold text-ink">Qué comparar</label><select id="summary-kind" name="tipo" defaultValue={filters.kind} className={control}><option value="all">Todas las donaciones</option><option value="money">Solo dinero</option><option value="supplies">Solo insumos</option></select></div>
        <div className="space-y-2"><label htmlFor="summary-currency" className="block font-bold text-ink">Moneda para comparar dinero</label><select id="summary-currency" name="moneda" defaultValue={filters.currency} className={control}>{currencies.map((currency) => <option key={currency}>{currency}</option>)}</select></div>
        <Button type="submit" variant="secondary">Ver comparación</Button>
      </form>
      <p className="text-ink-soft">{filters.kind === "money" ? `Se compara el dinero recibido en ${filters.currency}. Las otras monedas se consultan por separado.` : "Se compara cuántas donaciones ha hecho cada persona. Cada registro cuenta como una donación."}</p>
      <RankingBars rows={data.donors} axisLabel={filters.kind === "money" ? `Dinero recibido (${filters.currency})` : "Cantidad de donaciones"} unitLabel={filters.kind === "money" ? filters.currency : "donaciones"} integer={filters.kind !== "money"} valueLabel={filters.kind === "money" ? chartMoney : chartCount} empty="Todavía no hay donantes con aportes para esta comparación." />
      {data.unnamedCount > 0 && <p className="text-ink-soft">Hay {countLabel(data.unnamedCount)} sin donante identificado. Se incluyen en los totales.</p>}
    </Card>
    <Card className="space-y-3 p-5 sm:p-6"><h2 className="text-xl font-bold text-ink">Dinero recibido</h2><p className="text-ink-soft">Total por moneda, sin conversiones.</p>{moneyLabels.length ? <ul className="flex flex-wrap gap-3">{moneyLabels.map((label) => <li key={label} className="rounded-md bg-brand-soft px-4 py-3 text-xl font-bold text-brand">{label}</li>)}</ul> : <p className="text-ink-soft">Todavía no hay donaciones de dinero.</p>}</Card>
    {data.total > 0 && <Card className="space-y-4 p-5 sm:p-6"><h2 className="text-xl font-bold text-ink">¿Qué se ha recibido más?</h2><p className="text-ink-soft">Compara cuántas donaciones fueron de dinero y cuántas de insumos.</p><RankingBars rows={[{ label: "Dinero", value: data.moneyCount }, { label: "Insumos", value: data.suppliesCount }]} valueLabel={chartCount} /></Card>}
    <div className="grid items-start gap-6 md:grid-cols-2">
      <Card className="space-y-4 p-5 sm:p-6"><h2 className="text-xl font-bold text-ink">Insumos más donados</h2><p className="text-ink-soft">Los 5 insumos que se han recibido más veces, según su descripción y categoría. No se suman sacos, kilos ni unidades distintas.</p><RankingBars rows={data.items} valueLabel={chartCount} empty="Todavía no hay donaciones de insumos." /></Card>
      <Card className="space-y-4 p-5 sm:p-6"><h2 className="text-xl font-bold text-ink">Categorías más donadas</h2><p className="text-ink-soft">Cantidad de donaciones de insumos en cada categoría. Se muestran las 5 primeras.</p><RankingBars rows={data.categories} valueLabel={chartCount} empty="Todavía no hay donaciones de insumos." /></Card>
    </div>
  </main>;
}
