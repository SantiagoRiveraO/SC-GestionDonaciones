import { describe, expect, it } from "vitest";
import { barWidth, dashboardFilters, parseDashboard } from "./presentation";
describe("resumen", () => {
  it("maneja un sistema vacío sin inventar estadísticas", () => {
    expect(parseDashboard({})).toEqual({ total: 0, moneyCount: 0, suppliesCount: 0, unnamedCount: 0, moneyTotals: {}, donors: [], items: [], categories: [] });
  });
  it("conserva importes por moneda y descarta rankings inválidos", () => {
    const result = parseDashboard({ total: 3, money_count: 2, supplies_count: 1, money_totals: { USD: 10, VES: 100 }, donors: [{ id: "a", label: "Ana", value: 2 }, { label: "Sin aportes", value: 0 }, { label: "Error", value: -1 }] });
    expect(result.moneyTotals).toEqual({ USD: 10, VES: 100 });
    expect(result.donors).toEqual([{ id: "a", label: "Ana", value: 2, detail: undefined }]);
  });
  it("evita barras infinitas en cero y limita su ancho", () => {
    expect(barWidth(0, 0)).toBe(0); expect(barWidth(5, 10)).toBe(50); expect(barWidth(30, 10)).toBe(100);
  });
  it("normaliza filtros y rechaza tipos o monedas desconocidos", () => {
    expect(dashboardFilters({ tipo: "money", moneda: "ves" })).toEqual({ kind: "money", currency: "VES" });
    expect(dashboardFilters({ tipo: ["money"], moneda: "INVALID" })).toEqual({ kind: "all", currency: "USD" });
  });
});
