import type { Donation } from "@/types/database";

export type DonationFilters = {
  query: string;
  currency: string;
  method: string;
  from: string;
  to: string;
};

export type DonationSummary = {
  count: number;
  totalsByCurrency: { currency: string; total: number }[];
};

export const EMPTY_FILTERS: DonationFilters = {
  query: "",
  currency: "",
  method: "",
  from: "",
  to: "",
};

function includesQuery(donation: Donation, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    donation.concept,
    donation.method,
    donation.notes,
    donation.currency,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

export function filterDonations(
  donations: Donation[],
  filters: DonationFilters,
): Donation[] {
  const currency = filters.currency.trim().toUpperCase();
  const method = filters.method.trim().toLowerCase();

  return donations.filter((donation) => {
    if (!includesQuery(donation, filters.query)) return false;

    if (currency && donation.currency.toUpperCase() !== currency) {
      return false;
    }

    if (method) {
      const donationMethod = (donation.method ?? "").toLowerCase();
      if (!donationMethod.includes(method)) return false;
    }

    if (filters.from && donation.donated_at < filters.from) return false;
    if (filters.to && donation.donated_at > filters.to) return false;

    return true;
  });
}

export function summarizeDonations(donations: Donation[]): DonationSummary {
  const totals = new Map<string, number>();

  for (const donation of donations) {
    const current = totals.get(donation.currency) ?? 0;
    totals.set(donation.currency, current + donation.amount);
  }

  const totalsByCurrency = Array.from(totals.entries())
    .map(([currency, total]) => ({ currency, total }))
    .sort((a, b) => a.currency.localeCompare(b.currency));

  return {
    count: donations.length,
    totalsByCurrency,
  };
}

export function uniqueCurrencies(donations: Donation[]): string[] {
  return Array.from(new Set(donations.map((d) => d.currency))).sort();
}

export function uniqueMethods(donations: Donation[]): string[] {
  return Array.from(
    new Set(
      donations
        .map((d) => d.method?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

export function formatSummaryLine(summary: DonationSummary): string {
  if (summary.count === 0) {
    return "0 donaciones";
  }

  const totals = summary.totalsByCurrency
    .map((item) => `${item.currency} ${item.total.toFixed(2)}`)
    .join(" · ");

  const countLabel =
    summary.count === 1 ? "1 donación" : `${summary.count} donaciones`;

  return totals ? `${countLabel} · ${totals}` : countLabel;
}

export function hasActiveFilters(filters: DonationFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.currency.trim() !== "" ||
    filters.method.trim() !== "" ||
    filters.from !== "" ||
    filters.to !== ""
  );
}
