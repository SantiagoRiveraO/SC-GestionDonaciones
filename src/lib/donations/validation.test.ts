// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import {
  localTodayIsoDate,
  parseDonationInput,
  parseFlexibleAmount,
  type DonationInputValues,
} from "@/lib/donations/validation";

function localDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localTodayIsoDate(date);
}

function parse(values: DonationInputValues) {
  return parseDonationInput({ donor_mode: 'anonymous', ...values });
}

const validValues = {
  donor_mode: 'registered',
  amount: "10.50",
  currency: "usd",
  donated_at: "2024-06-15",
  method: "Transferencia",
  concept: "Útiles",
  notes: "Donación de prueba",
  donor_id: "9427d8e1-36f6-4d13-811b-44fdf2f820bd",
};

describe("parseDonationInput", () => {
  it("exige seleccionar una ficha y rechaza IDs o modos inválidos", () => {
    for (const values of [
      { ...validValues, donor_id: "" },
      { ...validValues, donor_id: "Eduardo Rafael" },
      { ...validValues, donor_mode: "otro" },
    ]) {
      const result = parseDonationInput(values);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.fieldErrors.donor_id).toBeTruthy();
    }
  });

  it("solo permite omitir el donante mediante la opción explícita y descarta IDs anteriores", () => {
    const { donor_id: omittedId, donor_mode: omittedMode, ...withoutDonor } = validValues;
    void omittedId; void omittedMode;
    expect(parseDonationInput(withoutDonor).ok).toBe(false);
    const result = parseDonationInput({ ...validValues, donor_mode: "anonymous" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.donor_id).toBeNull();
  });

  it.each(["1.2,30", "1,2,3.45", "1234.567,89", "1 2,50"])("rechaza separadores mal agrupados: %s", (amount) => {
    expect(parseFlexibleAmount(amount)).toBeNull();
  });
  it("acepta miles correctamente agrupados, incluidos espacios", () => {
    expect(parseFlexibleAmount("1.234.567,89")).toBe(1234567.89);
    expect(parseFlexibleAmount("1 250,50")).toBe(1250.5);
  });
  it("valida hoy según Caracas aunque en UTC ya sea mañana", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-10-05T02:00:00Z"));
      expect(localTodayIsoDate()).toBe("2026-10-04");
      expect(parse({ ...validValues, donated_at: "2026-10-04" }).ok).toBe(true);
      expect(parse({ ...validValues, donated_at: "2026-10-05" }).ok).toBe(false);
    } finally { vi.useRealTimers(); }
  });
  it.each(["food", "clothing", "medicine", "hygiene", "school", "other"])("acepta la categoría %s para insumos", (category) => {
    const result = parse({ kind: "supplies", category, item_description: "Sacos de harina", donated_at: validValues.donated_at });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.category).toBe(category);
  });

  it("rechaza IDs de categoría inválidos y limpia la categoría al cambiar a dinero", () => {
    const invalid = parse({ kind: "supplies", category: "id no válido", item_description: "Ropa", donated_at: validValues.donated_at });
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.fieldErrors.category).toBeTruthy();
    const money = parse({ ...validValues, category: "food" });
    expect(money.ok).toBe(true);
    if (money.ok) expect(money.data.category).toBeNull();
  });
  it("acepta IDs de categorías creadas por la fundación", () => {
    const result = parse({ kind: "supplies", category: "9427d8e1-36f6-4d13-811b-44fdf2f820bd", item_description: "Cemento", donated_at: validValues.donated_at });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.category).toBe("9427d8e1-36f6-4d13-811b-44fdf2f820bd");
  });
  it("registra insumos sin monto ni moneda y descarta campos de dinero", () => {
    const result = parse({
      ...validValues, kind: "supplies", item_description: " Arroz ", quantity: "2,50", unit: " kg ",
      amount: "texto inválido", currency: "", method: "Efectivo",
    });
    expect(result).toEqual({
      ok: true, data: {
        category: null, kind: "supplies", item_description: "Arroz", quantity: 2.5, unit: "kg",
        amount: null, currency: null, method: null, donated_at: validValues.donated_at,
        concept: validValues.concept, notes: validValues.notes, donor_id: validValues.donor_id,
      }
    });
  });

  it("permite insumos con cantidad desconocida", () => {
    const result = parse({ kind: "supplies", item_description: "Ropa variada", donated_at: validValues.donated_at });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toMatchObject({ quantity: null, unit: null, amount: null, currency: null });
  });

  it("pide descripción para los insumos", () => {
    const result = parse({ kind: "supplies", donated_at: validValues.donated_at });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.fieldErrors)).toEqual(["item_description"]);
  });

  it.each(["0", "-1", "abc", "2,555", "10000000000"])("rechaza la cantidad de insumos %s", (quantity) => {
    const result = parse({ kind: "supplies", item_description: "Arroz", donated_at: validValues.donated_at, quantity, unit: "kg" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.quantity).toBeTruthy();
  });

  it("pide cantidad y unidad juntas", () => {
    const withoutUnit = parse({ kind: "supplies", item_description: "Arroz", donated_at: validValues.donated_at, quantity: "10" });
    const withoutQuantity = parse({ kind: "supplies", item_description: "Arroz", donated_at: validValues.donated_at, unit: "kg" });
    expect(withoutUnit.ok).toBe(false);
    expect(withoutQuantity.ok).toBe(false);
    if (!withoutUnit.ok) expect(withoutUnit.fieldErrors.unit).toBeTruthy();
    if (!withoutQuantity.ok) expect(withoutQuantity.fieldErrors.quantity).toBeTruthy();
  });

  it("rechaza tipo inválido y En especie como pago de dinero", () => {
    expect(parse({ ...validValues, kind: "otra" }).ok).toBe(false);
    expect(parse({ ...validValues, method: "En especie" }).ok).toBe(false);
  });

  it("limita descripción y unidad y descarta insumos al cambiar a dinero", () => {
    const invalid = parse({ ...validValues, kind: "supplies", item_description: "x".repeat(201), quantity: "2", unit: "u".repeat(41) });
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.fieldErrors).toMatchObject({ item_description: "Máximo 200 caracteres.", unit: "Máximo 40 caracteres." });
    const money = parse({ ...validValues, kind: "money", item_description: "Ropa", quantity: "2", unit: "cajas" });
    expect(money.ok).toBe(true);
    if (money.ok) expect(money.data).toMatchObject({ item_description: null, quantity: null, unit: null });
  });
  it("acepta un caso válido, recorta espacios y pasa la moneda a mayúsculas", () => {
    const result = parse({
      amount: " 10.50 ",
      currency: " usd ",
      donated_at: "2024-06-15",
      method: " Transferencia ",
      concept: " Útiles ",
      notes: " Donación de prueba ",
      donor_id: " 9427d8e1-36f6-4d13-811b-44fdf2f820bd ",
      donor_mode: 'registered',
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
        donor_id: "9427d8e1-36f6-4d13-811b-44fdf2f820bd",
      },
    });
  });

  it("convierte textos vacíos en null", () => {
    const result = parse({
      amount: "0",
      currency: "VES",
      donated_at: "2000-01-01",
      method: "   ",
      concept: "",
      notes: null,
      donor_id: undefined,
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
        donor_id: null,
      },
    });
  });

  it("acepta el límite de decimales, el tope de monto y las longitudes máximas", () => {
    const result = parse({
      amount: "9999999999.99",
      currency: "EUR",
      donated_at: localTodayIsoDate(),
      method: "x".repeat(50),
      concept: "c".repeat(200),
      notes: "n".repeat(2000),

    });

    expect(result.ok).toBe(true);
  });

  it("rechaza decimales de más", () => {
    expect(
      parse({ ...validValues, amount: "25,555" }),
    ).toEqual({
      ok: false,
      fieldErrors: { amount: "Escribe el monto con números. Ejemplo: 25,50" },
    });

    expect(
      parse({ ...validValues, amount: "10.5555" }),
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
      const result = parse({ ...validValues, amount });
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
          donor_id: "9427d8e1-36f6-4d13-811b-44fdf2f820bd",
        },
      });
    }
  });

  it("rechaza un monto negativo o demasiado grande", () => {
    expect(
      parse({ ...validValues, amount: "-1" }),
    ).toEqual({
      ok: false,
      fieldErrors: { amount: "Escribe el monto con números. Ejemplo: 25,50" },
    });

    expect(
      parse({ ...validValues, amount: "10000000000" }),
    ).toEqual({
      ok: false,
      fieldErrors: { amount: "Escribe el monto con números. Ejemplo: 25,50" },
    });
  });

  it("rechaza una fecha futura usando el día local", () => {
    const result = parse({
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
      parse({ ...validValues, donated_at: "2024-13-40" }),
    ).toEqual({
      ok: false,
      fieldErrors: { donated_at: "Ingresa una fecha válida." },
    });

    expect(
      parse({ ...validValues, donated_at: "1999-12-31" }),
    ).toEqual({
      ok: false,
      fieldErrors: { donated_at: "La fecha no puede ser anterior al 2000." },
    });
  });

  it("rechaza una moneda que no sean 3 letras", () => {
    expect(parse({ ...validValues, currency: "US" })).toEqual({
      ok: false,
      fieldErrors: { currency: "Ingresa una moneda de 3 letras." },
    });
  });

  it("rechaza textos que superan el máximo", () => {
    const result = parse({
      ...validValues,
      method: "x".repeat(51),
      concept: "c".repeat(201),
      notes: "n".repeat(2001),

    });

    expect(result).toEqual({
      ok: false,
      fieldErrors: {
        method: "Máximo 50 caracteres.",
        concept: "Máximo 200 caracteres.",
        notes: "Máximo 2000 caracteres.",

      },
    });
  });
});
