// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  parseDonationFilters,
  serializeDonationFilters,
} from "@/lib/donations/filters";

describe("parseDonationFilters", () => {
  it("usa página 1 y filtros vacíos si no hay parámetros", () => {
    expect(parseDonationFilters(new URLSearchParams())).toEqual({
      q: null,
      currency: null,
      method: null,
      from: null,
      to: null,
      page: 1,
    });
  });

  it("lee los nombres en español de la URL", () => {
    const params = new URLSearchParams({
      q: " útiles ",
      moneda: "usd",
      metodo: "Efectivo",
      desde: "2026-01-01",
      hasta: "2026-12-31",
      pagina: "3",
    });

    expect(parseDonationFilters(params)).toEqual({
      q: "útiles",
      currency: "USD",
      method: "Efectivo",
      from: "2026-01-01",
      to: "2026-12-31",
      page: 3,
    });
  });

  it("ignora parámetros basura en vez de fallar", () => {
    expect(
      parseDonationFilters({
        q: "  ",
        moneda: "USDX",
        metodo: "",
        desde: "2024-13-01",
        hasta: "no-es-fecha",
        pagina: "abc",
        extra: "ignorado",
        foo: ["1", "2"],
      }),
    ).toEqual({
      q: null,
      currency: null,
      method: null,
      from: null,
      to: null,
      page: 1,
    });
  });

  it("ignora páginas inválidas y arranca en 1", () => {
    expect(parseDonationFilters({ pagina: "0" }).page).toBe(1);
    expect(parseDonationFilters({ pagina: "-2" }).page).toBe(1);
    expect(parseDonationFilters({ pagina: "2.5" }).page).toBe(1);
    expect(parseDonationFilters({ pagina: "02" }).page).toBe(1);
  });
});

describe("serializeDonationFilters", () => {
  it("omite vacíos y la página 1", () => {
    const params = serializeDonationFilters({
      q: " útiles ",
      currency: "usd",
      method: "Efectivo",
      from: "2026-01-01",
      to: "",
      page: 1,
    });

    expect(Object.fromEntries(params.entries())).toEqual({
      q: "útiles",
      moneda: "USD",
      metodo: "Efectivo",
      desde: "2026-01-01",
    });
  });

  it("incluye la página a partir de 2", () => {
    const params = serializeDonationFilters({ page: 2 });
    expect(params.get("pagina")).toBe("2");
  });

  it("hace ida y vuelta con search params válidos", () => {
    const original = new URLSearchParams({
      q: "útiles",
      moneda: "VES",
      metodo: "Zelle",
      desde: "2026-02-01",
      hasta: "2026-02-28",
      pagina: "4",
    });

    const parsed = parseDonationFilters(original);
    const serialized = serializeDonationFilters(parsed);

    expect(parseDonationFilters(serialized)).toEqual(parsed);
  });
});
