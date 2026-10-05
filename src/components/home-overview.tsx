import Link from "next/link";
import { ChartNoAxesCombined, CirclePlus, HandHeart, List, Users } from "lucide-react";
import { DonationTotals } from "@/components/donation-totals";
import { DonationsTable } from "@/components/donations-table";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MonthSummary } from "@/lib/donations/queries";
import { formatTodayLong } from "@/lib/format";
import { donationSummaryLabels } from "@/lib/donations/presentation";

import type { DonationListRow } from "@/types/database";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

export function HomeOverview({ displayName, month, recent }: { displayName: string; month: MonthSummary; recent: DonationListRow[] }) {
  const moneyRows = month.rows.filter((row) => row.kind === "money");
  const moneyCount = moneyRows.reduce((sum, row) => sum + row.donation_count, 0);
  const suppliesCount = month.rows.filter((row) => row.kind === "supplies").reduce((sum, row) => sum + row.donation_count, 0);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-1">
        <h1 className="text-[30px] leading-tight font-bold text-ink">
          Hola, {displayName}
        </h1>
        <p className="text-ink-soft">Hoy es {formatTodayLong()}</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <ButtonLink
          href="/donations/new"
          size="lg"
          icon={<CirclePlus aria-hidden className="size-7" />}
          className="col-span-2 w-full min-h-[64px] text-lg"
        >
          Registrar una donación
        </ButtonLink>
        <ButtonLink
          href="/donations"
          variant="secondary"
          size="lg"
          icon={<List aria-hidden className="hidden size-5 sm:block" />}
          className="w-full min-h-[56px] px-3"
        >
          Donaciones
        </ButtonLink>
        <ButtonLink href="/donors" variant="secondary" size="lg" icon={<Users aria-hidden className="hidden size-5 sm:block" />} className="w-full min-h-[56px] px-3">Donantes</ButtonLink>
      </div>

      <DonationTotals title="Este mes" total={month.total} moneyCount={moneyCount} suppliesCount={suppliesCount} moneyLabels={donationSummaryLabels(moneyRows)} emptyMessage="Este mes todavía no hay donaciones." />

      <Link href="/summary" className={`inline-flex min-h-[48px] items-center gap-3 self-start rounded-md font-bold text-brand underline underline-offset-4 ${focusRing}`}><ChartNoAxesCombined aria-hidden className="size-6" />Ver resumen →</Link>

      {recent.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 px-5 py-10 text-center">
          <HandHeart aria-hidden className="size-12 text-accent" />
          <p className="text-lg text-ink">
            Todavía no hay donaciones. ¡Registra la primera!
          </p>
          <ButtonLink
            href="/donations/new"
            icon={<CirclePlus aria-hidden className="size-5" />}
          >
            Registrar una donación
          </ButtonLink>
        </Card>
      ) : (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-ink">Últimas donaciones</h2>
          <DonationsTable rows={recent} total={recent.length} />
          <Link
            href="/donations"
            className={`inline-flex min-h-[48px] items-center rounded-md font-bold text-brand ${focusRing}`}
          >
            Donaciones →
          </Link>
        </section>
      )}
    </main>
  );
}
