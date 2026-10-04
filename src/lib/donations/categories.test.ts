// @vitest-environment node
import { describe, expect, it } from "vitest";
import { categoryNameError } from "@/lib/donations/categories";

describe("nombres de categorías editables", () => {
  it("acepta un nombre claro y nombres de hasta 80 caracteres", () => {
    expect(categoryNameError("Materiales de construcción")).toBeNull();
    expect(categoryNameError("x".repeat(80))).toBeNull();
  });
  it("pide nombre y rechaza nombres demasiado largos", () => {
    expect(categoryNameError("   ")).toBeTruthy();
    expect(categoryNameError("x".repeat(81))).toBeTruthy();
  });
});
