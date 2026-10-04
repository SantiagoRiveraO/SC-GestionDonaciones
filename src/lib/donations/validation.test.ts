// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  localTodayIsoDate,
  parseDonationInput,
  parseFlexibleAmount,
} from "@/lib/donations/validation";

function localDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localTodayIsoDate(date);
}

const validValues = {
  amount: "10.50",
  currency: "usd",
  donated_at: "2024-06-15",
  method: "Transferencia",
  concept: "Útiles",
  notes: "Donación de prueba",
  donor_name: "Carmen Rivas",
};

describe("parseDonationInput", () => {
  it.each(["food", "clothing", "medicine", "hygiene", "school", "other"])("acepta la categoría %s para insumos", (category) => {
    const result = parseDonationInput({ kind: "supplies", category, item_description: "Sacos de harina", donated_at: validValues.donated_at });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.category).toBe(category);
  });

  it("rechaza IDs de categoría inválidos y limpia la categoría al cambiar a dinero", () => {
    const invalid = parseDonationInput({ kind: "supplies", category: "id no válido", item_description: "Ropa", donated_at: validValues.donated_at });
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.fieldErrors.category).toBeTruthy();
    const money = parseDonationInput({ ...validValues, category: "food" });
    expect(money.ok).toBe(true);
    if (money.ok) expect(money.data.category).toBeNull();
  });
  it("acepta IDs de categorías creadas por la fundación", () => {
    const result = parseDonationInput({ kind: "supplies", category: "9427d8e1-36f6-4d13-811b-44fdf2f820bd", item_description: "Cemento", donated_at: validValues.donated_at });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.category).toBe("9427d8e1-36f6-4d13-811b-44fdf2f820bd");
  });
  it("registra insumos sin monto ni moneda y descarta campos de dinero", () => {
    const result = parseDonationInput({
      ...validValues, kind: "supplies", item_description: " Arroz ", quantity: "2,50", unit: " kg ",
      amount: "texto inválido", currency: "", method: "Efectivo",
    });
    expect(result).toEqual({
      ok: true, data: {
        category: null, kind: "supplies", item_description: "Arroz", quantity: 2.5, unit: "kg",
        amount: null, currency: null, method: null, donated_at: validValues.donated_at,
        concept: validValues.concept, notes: validValues.notes, donor_name: validValues.donor_name,
      }
    });
  });

  it("permite insumos con cantidad desconocida", () => {
    const result = parseDonationInput({ kind: "supplies", item_description: "Ropa variada", donated_at: validValues.donated_at });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toMatchObject({ quantity: null, unit: null, amount: null, currency: null });
  });

  it("pide descripción para los insumos", () => {
    const result = parseDonationInput({ kind: "supplies", donated_at: validValues.donated_at });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.fieldErrors)).toEqual(["item_description"]);
  });

  it.each(["0", "-1", "abc", "2,555", "10000000000"])("rechaza la cantidad de insumos %s", (quantity) => {
    const result = parseDonationInput({ kind: "supplies", item_description: "Arroz", donated_at: validValues.donated_at, quantity, unit: "kg" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.quantity).toBeTruthy();
  });

  it("pide cantidad y unidad juntas", () => {
    const withoutUnit = parseDonationInput({ kind: "supplies", item_description: "Arroz", donated_at: validValues.donated_at, quantity: "10" });
    const withoutQuantity = parseDonationInput({ kind: "supplies", item_description: "Arroz", donated_at: validValues.donated_at, unit: "kg" });
    expect(withoutUnit.ok).toBe(false);
    expect(withoutQuantity.ok).toBe(false);
    if (!withoutUnit.ok) expect(withoutUnit.fieldErrors.unit).toBeTruthy();
    if (!withoutQuantity.ok) expect(withoutQuantity.fieldErrors.quantity).toBeTruthy();
  });

  it("rechaza tipo inválido y En especie como pago de dinero", () => {
    expect(parseDonationInput({ ...validValues, kind: "otra" }).ok).toBe(false);
    expect(parseDonationInput({ ...validValues, method: "En especie" }).ok).toBe(false);
  });

  it("limita descripción y unidad y descarta insumos al cambiar a dinero", () => {
    const invalid = parseDonationInput({ ...validValues, kind: "supplies", item_description: "x".repeat(201), quantity: "2", unit: "u".repeat(41) });
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.fieldErrors).toMatchObject({ item_description: "Máximo 200 caracteres.", unit: "Máximo 40 caracteres." });
    const money = parseDonationInput({ ...validValues, kind: "money", item_description: "Ropa", quantity: "2", unit: "cajas" });
    expect(money.ok).toBe(true);
    if (money.ok) expect(money.data).toMatchObject({ item_description: null, quantity: null, unit: null });
  });
  it("acepta un caso válido, recorta espacios y pasa la moneda a mayúsculas", () => {
    const result = parseDonationInput({
      amount: " 10.50 ",
      currency: " usd ",
      donated_at: "2024-06-15",
      method: " Transferencia ",
      concept: " Útiles ",
      notes: " Donación de prueba ",
      donor_name: " Carmen Rivas ",
    });

    expect(result).toEqual({
      ok: true,
      data: {
        category: null, kind: "money", item_description: null, quantity: null, unit: null,
        amount: 10.5,
        currency: "USD",
        donated_at: "2024-06-15",
        method: "Transferencia",
        concept: "Útiles",
        notes: "Donación de prueba",
        donor_name: "Carmen Rivas",
      },
    });
  });

  it("convierte textos vacíos en null", () => {
    const result = parseDonationInput({
      amount: "0",
      currency: "VES",
      donated_at: "2000-01-01",
      method: "   ",
      concept: "",
      notes: null,
      donor_name: undefined,
    });

    expect(result).toEqual({
      ok: true,
      data: {
        category: null, kind: "money", item_description: null, quantity: null, unit: null,
        amount: 0,
        currency: "VES",
        donated_at: "2000-01-01",
        method: null,
        concept: null,
        notes: null,
        donor_name: null,
      },
    });
  });

  it("acepta el límite de decimales, el tope de monto y las longitudes máximas", () => {
    const result = parseDonationInput({
      amount: "9999999999.99",
      currency: "EUR",
      donated_at: localTodayIsoDate(),
      method: "x".repeat(50),
      concept: "c".repeat(200),
      notes: "n".repeat(2000),
      donor_name: "d".repeat(200),
    });

    expect(result.ok).toBe(true);
  });

  it("rechaza decimales de más", () => {
    expect(
      parseDonationInput({ ...validValues, amount: "25,555" }),
    ).toEqual({
      ok: false,
      fieldErrors: { amount: "Escribe el monto con números. Ejemplo: 25,50" },
    });

    expect(
      parseDonationInput({ ...validValues, amount: "10.5555" }),
    ).toEqual({
      ok: false,
      fieldErrors: { amount: "Escribe el monto con números. Ejemplo: 25,50" },
    });
  });

  it("acepta montos con coma, punto y separadores de miles", () => {
    const cases: Array<[string, number]> = [
      ["25,50", 25.5],
      ["25.50", 25.5],
      ["1.250,50", 1250.5],
      ["1,250.50", 1250.5],
      ["1250", 1250],
      ["1.250", 1250],
      ["1.250.000", 1_250_000],
      ["  25,50  ", 25.5],
    ];

    for (const [amount, expected] of cases) {
      expect(parseFlexibleAmount(amount)).toBe(expected);
      const result = parseDonationInput({ ...validValues, amount });
      expect(result).toEqual({
        ok: true,
        data: {
          category: null, kind: "money", item_description: null, quantity: null, unit: null,
          amount: expected,
          currency: "USD",
          donated_at: "2024-06-15",
          method: "Transferencia",
          concept: "Útiles",
          notes: "Donación de prueba",
          donor_name: "Carmen Rivas",
        },
      });
    }
  });

  it("rechaza un monto negativo o demasiado grande", () => {
    expect(
      parseDonationInput({ ...validValues, amount: "-1" }),
    ).toEqual({
      ok: false,
      fieldErrors: { amount: "Escribe el monto con números. Ejemplo: 25,50" },
    });

    expect(
      parseDonationInput({ ...validValues, amount: "10000000000" }),
    ).toEqual({
      ok: false,
      fieldErrors: { amount: "Escribe el monto con números. Ejemplo: 25,50" },
    });
  });

  it("rechaza una fecha futura usando el día local", () => {
    const result = parseDonationInput({
      ...validValues,
      donated_at: localDateOffset(1),
    });

    expect(result).toEqual({
      ok: false,
      fieldErrors: {
        donated_at: "La fecha no puede ser futura. Revisa el día.",
      },
    });
  });

  it("rechaza fechas inválidas o anteriores a 2000", () => {
    expect(
      parseDonationInput({ ...validValues, donated_at: "2024-13-40" }),
    ).toEqual({
      ok: false,
      fieldErrors: { donated_at: "Ingresa una fecha válida." },
    });

    expect(
      parseDonationInput({ ...validValues, donated_at: "1999-12-31" }),
    ).toEqual({
      ok: false,
      fieldErrors: { donated_at: "La fecha no puede ser anterior al 2000." },
    });
  });

  it("rechaza una moneda que no sean 3 letras", () => {
    expect(parseDonationInput({ ...validValues, currency: "US" })).toEqual({
      ok: false,
      fieldErrors: { currency: "Ingresa una moneda de 3 letras." },
    });
  });

  it("rechaza textos que superan el máximo", () => {
    const result = parseDonationInput({
      ...validValues,
      method: "x".repeat(51),
      concept: "c".repeat(201),
      notes: "n".repeat(2001),
      donor_name: "d".repeat(201),
    });

    expect(result).toEqual({
      ok: false,
      fieldErrors: {
        method: "Máximo 50 caracteres.",
        concept: "Máximo 200 caracteres.",
        notes: "Máximo 2000 caracteres.",
        donor_name: "Máximo 200 caracteres.",
      },
    });
  });
});
