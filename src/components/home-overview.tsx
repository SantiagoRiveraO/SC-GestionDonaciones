import Link from "next/link";
import { CalendarDays, ChartNoAxesCombined, CirclePlus, HandHeart, List, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MonthSummary } from "@/lib/donations/queries";
import {
  formatDate,
  formatTodayLong,
} from "@/lib/format";
import { donationSummaryLabels, donationValueLabel } from "@/lib/donations/presentation";

import type { DonationListRow } from "@/types/database";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

function donationDate(donation: DonationListRow) {
  return donation.donated_at ? formatDate(donation.donated_at) : "—";
}

export function HomeOverview({ displayName, month, recent }: { displayName: string; month: MonthSummary; recent: DonationListRow[] }) {
  const monthCountLabel =
    month.total === 1 ? "1 donación" : `${month.total} donaciones`;
  const monthTotals = donationSummaryLabels(month.rows);

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

      <Card className="space-y-2 p-4">
        <div className="flex items-center gap-2 font-bold text-ink">
          <CalendarDays aria-hidden className="size-6 text-accent" />
          Este mes
        </div>
        {month.total === 0 ? (
          <p className="text-ink-soft">
            Este mes todavía no hay donaciones.
          </p>
        ) : (
          <>
            <p className="text-[30px] leading-tight font-bold text-ink">
              {monthCountLabel}
            </p>
            <ul className="space-y-1">
              {monthTotals.map((line) => (
                <li key={line} className="text-lg font-bold text-ink">
                  {line}
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

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
          <ul className="space-y-3">
            {recent.map((donation, index) => {
              const href = donation.id ? `/donations/${donation.id}` : undefined;

              const content = (
                <>
                  <div className="space-y-1">
                    <p className="text-ink-soft">{donationDate(donation)}</p>
                    <p className="text-ink">
                      {donation.donor_name?.trim() || "Sin donante"}
                    </p>
                    <p className="break-words text-ink-soft">{donation.kind === "supplies" ? donation.item_description : donation.method || "Dinero"}</p>
                  </div>
                  <p className="text-lg font-bold text-ink">
                    {donationValueLabel(donation)}
                  </p>
                </>
              );

              return (
                <li key={donation.id ?? `recent-${index}`}>
                  {href ? (
                    <Card className="p-0">
                      <Link
                        href={href}
                        className={`flex min-h-[64px] flex-col justify-between gap-3 rounded-[12px] p-4 sm:flex-row sm:items-center ${focusRing}`}
                      >
                        {content}
                      </Link>
                    </Card>
                  ) : (
                    <Card className="flex min-h-[64px] flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
                      {content}
                    </Card>
                  )}
                </li>
              );
            })}
          </ul>
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
