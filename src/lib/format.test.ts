// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  firstDayOfMonthInCaracas,
  formatDate,
  formatDateTime,
  formatLongDate,
  formatMoney,
  formatSummaryLine,
  formatTodayLong,
  todayInCaracas,
} from "@/lib/format";

describe("formatMoney", () => {
  it("muestra el código y el monto en formato es-VE", () => {
    expect(formatMoney(1250, "USD")).toBe("USD 1.250,00");
    expect(formatMoney(3400, "VES")).toBe("VES 3.400,00");
  });
});

describe("formatDate", () => {
  it("pasa YYYY-MM-DD a dd/mm/aaaa sin usar Date", () => {
    expect(formatDate("2026-01-01")).toBe("01/01/2026");
    expect(formatDate("2026-01-01T23:00:00.000Z")).toBe("01/01/2026");
  });
});

describe("formatDateTime", () => {
  it("formatea un ISO en hora de Caracas como dd/mm/aaaa hh:mm", () => {
    expect(formatDateTime("2026-03-15T13:05:00.000Z")).toBe("15/03/2026 09:05");
    expect(formatDateTime("2026-03-16T02:30:00.000Z")).toBe("15/03/2026 22:30");
  });
});

describe("formatLongDate", () => {
  it("escribe la fecha completa sin usar Date ni zona horaria", () => {
    expect(formatLongDate("2026-10-04")).toBe("4 de octubre de 2026");
    expect(formatLongDate("2026-01-01")).toBe("1 de enero de 2026");
    expect(formatLongDate("2026-01-01T23:00:00.000Z")).toBe(
      "1 de enero de 2026",
    );
  });
});

describe("fechas en America/Caracas", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("toma el día de Caracas cuando UTC ya es el día siguiente", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-05T02:00:00.000Z"));

    expect(todayInCaracas()).toBe("2026-10-04");
    expect(firstDayOfMonthInCaracas()).toBe("2026-10-01");
    expect(formatTodayLong()).toBe("domingo 4 de octubre de 2026");
  });

  it("cambia de mes a la medianoche de Caracas", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T03:59:00.000Z"));
    expect(todayInCaracas()).toBe("2026-10-31");
    expect(firstDayOfMonthInCaracas()).toBe("2026-10-01");

    vi.setSystemTime(new Date("2026-11-01T04:00:00.000Z"));
    expect(todayInCaracas()).toBe("2026-11-01");
    expect(firstDayOfMonthInCaracas()).toBe("2026-11-01");
    expect(formatTodayLong()).toBe("domingo 1 de noviembre de 2026");
  });
});

describe("formatSummaryLine", () => {
  it("usa el total del listado y los montos por moneda", () => {
    expect(
      formatSummaryLine(
        [
          { currency: "USD", total: 1250 },
          { currency: "VES", total: 3400 },
        ],
        12,
      ),
    ).toBe("12 donaciones · USD 1.250,00 · VES 3.400,00");
  });
});
