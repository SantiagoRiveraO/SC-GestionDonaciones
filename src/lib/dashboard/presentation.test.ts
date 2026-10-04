import { describe, expect, it } from "vitest";
import { barWidth, chartScale, dashboardFilters, parseDashboard } from "./presentation";
describe("resumen", () => {
  it("usa un eje común desde cero sin fracciones para contar donaciones", () => {
    expect(chartScale([4, 3], true)).toEqual({ maximum: 4, ticks: [0, 2, 4] });
    expect(chartScale([5, 1], true)).toEqual({ maximum: 6, ticks: [0, 3, 6] });
    expect(chartScale([1], true)).toEqual({ maximum: 2, ticks: [0, 1, 2] });
  });
  it("permite una escala de importes pequeños y maneja un gráfico vacío", () => {
    expect(chartScale([0.03, 0.01], false)).toEqual({ maximum: 0.04, ticks: [0, 0.02, 0.04] });
    expect(chartScale([], true)).toEqual({ maximum: 2, ticks: [0, 1, 2] });
  });
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
