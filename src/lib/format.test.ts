// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatSummaryLine,
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
