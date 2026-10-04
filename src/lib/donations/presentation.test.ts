import { describe, expect, it } from "vitest";
import { donationSummaryLabels, donationValueLabel } from "@/lib/donations/presentation";

describe("presentación de dinero e insumos", () => {
  it("muestra cantidad y unidad sin inventar un monto", () => {
    expect(donationValueLabel({ kind: "supplies", amount: null, currency: null, quantity: 2.5, unit: "kg" })).toBe("2,5 kg");
    expect(donationValueLabel({ kind: "supplies", amount: null, currency: null, quantity: null, unit: null })).toBe("Cantidad no especificada");
    expect(donationValueLabel({ kind: "money", amount: 25, currency: "USD", quantity: null, unit: null })).toBe("USD 25,00");
  });

  it("cuenta insumos aparte y mantiene separados los totales por moneda", () => {
    expect(donationSummaryLabels([
      { kind: "supplies", currency: null, total: 0, donation_count: 3 },
      { kind: "money", currency: "USD", total: 50, donation_count: 2 },
      { kind: "money", currency: "VES", total: 1000, donation_count: 1 },
    ])).toEqual(["USD 50,00", "VES 1.000,00", "3 donaciones de insumos"]);
    expect(donationSummaryLabels([{ kind: "supplies", currency: null, total: 0, donation_count: 1 }])).toEqual(["1 donación de insumos"]);
  });
});
