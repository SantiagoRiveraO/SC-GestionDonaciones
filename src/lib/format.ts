const AMOUNT_FORMAT = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Always "USD 1.250,00": the same shape as the summary line, whatever the
// currency (es-VE would print the bolívar as "Bs.S" and the rest as codes).
export function formatMoney(amount: number, currency: string): string {
  return `${currency} ${AMOUNT_FORMAT.format(amount)}`;
}

export function formatDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) {
    return isoDate;
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
}

// Venezuela time: on the server (UTC on Vercel) local time would be 4 hours off.
const DATE_TIME_FORMAT = new Intl.DateTimeFormat("es-VE", {
  timeZone: "America/Caracas",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  const parts = Object.fromEntries(
    DATE_TIME_FORMAT.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
}

export function formatSummaryLine(
  rows: { currency: string; total: number }[],
  total: number,
): string {
  if (total === 0) {
    return "0 donaciones";
  }

  const countLabel = total === 1 ? "1 donación" : `${total} donaciones`;
  const totals = [...rows]
    .sort((a, b) => a.currency.localeCompare(b.currency))
    .map((row) => formatMoney(row.total, row.currency))
    .join(" · ");

  return totals ? `${countLabel} · ${totals}` : countLabel;
}
