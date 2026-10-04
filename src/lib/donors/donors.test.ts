// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parseDonorInput } from "@/lib/donors/validation";
import { donorsHref, parseDonorFilters } from "@/lib/donors/filters";
import { donorMoneyLabels } from "@/lib/donors/presentation";

describe("registro de donantes", () => {
  it("solo exige el nombre y limpia datos opcionales vacíos", () => {
    expect(parseDonorInput({ full_name: " Carmen Rivas ", phone: " ", email: "", notes: "" })).toEqual({ ok: true, data: { full_name: "Carmen Rivas", phone: null, email: null, notes: null } });
  });
  it("acepta organizaciones, teléfono y correo válidos", () => {
    const result = parseDonorInput({ full_name: "Fundación de apoyo", phone: " +58 (414) 123 4567 ", email: "ayuda+donantes@ejemplo.com", notes: " Contactar por teléfono " });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toMatchObject({ phone: "+58 (414) 123 4567", notes: "Contactar por teléfono" });
  });
  it("señala nombre vacío, correo incorrecto y textos demasiado largos", () => {
    const result = parseDonorInput({ full_name: " ", phone: "1".repeat(41), email: "correo incorrecto", notes: "x".repeat(2001) });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors)).toEqual(["full_name", "phone", "email", "notes"]);
    expect(parseDonorInput({ full_name: "x".repeat(201), phone: "", email: "", notes: "" }).ok).toBe(false);
  });
  it("acepta las longitudes máximas de nombre, teléfono y notas", () => {
    expect(parseDonorInput({ full_name: "x".repeat(200), phone: "1".repeat(40), email: "", notes: "x".repeat(2000) }).ok).toBe(true);
  });
});

describe("búsqueda y orden de donantes", () => {
  it("arranca con más donaciones y corrige parámetros inválidos", () => {
    expect(parseDonorFilters({ orden: "basura", moneda: "USDextra", pagina: "2.5", q: " " })).toEqual({ sort: "frequency", currency: "USD", page: 1, q: "" });
    expect(parseDonorFilters({ pagina: "0" }).page).toBe(1);
    expect(parseDonorFilters({ pagina: "999999999999999999" }).page).toBe(1);
  });
  it("mantiene moneda, búsqueda y orden al cambiar de página", () => {
    const filters = parseDonorFilters({ orden: "money", moneda: "ves", pagina: "3", q: " Carmen %_ " });
    expect(filters).toEqual({ sort: "money", currency: "VES", page: 3, q: "Carmen %_" });
    const url = new URL(donorsHref(filters), "https://example.test");
    expect(parseDonorFilters(Object.fromEntries(url.searchParams))).toEqual(filters);
  });
  it("no pone la moneda en la URL cuando compara la frecuencia", () => {
    expect(donorsHref({ sort: "frequency", currency: "VES", page: 1 })).toBe("/donors");
  });
});

describe("aportes por donante", () => {
  it("muestra cada moneda por separado y nunca las suma entre sí", () => {
    expect(donorMoneyLabels({ USD: 25.5, VES: 1000, EUR: 0 })).toEqual(["EUR 0,00", "USD 25,50", "VES 1.000,00"]);
  });
  it("tolera un donante sin dinero y descarta datos inválidos", () => {
    expect(donorMoneyLabels(null)).toEqual([]);
    expect(donorMoneyLabels({ USD: -1, VES: "100", insumos: 12 })).toEqual([]);
  });
});
