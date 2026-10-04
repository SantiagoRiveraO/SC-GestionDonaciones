import { describe, expect, it } from "vitest";
import { possibleSameDonor } from "./selection";

const candidate = { id: "test", full_name: "Empresa Toquitos", phone: "+58 414 123 4567", email: "contacto@toquitos.test" };
const values = { full_name: "Otro donante", phone: "", email: "" };
describe("posibles fichas repetidas", () => {
  it("avisa de nombres parecidos del ejemplo del usuario sin fusionarlos", () => {
    expect(possibleSameDonor(candidate, { ...values, full_name: "Eduardo Rafael de Toquito" })).toBe(true);
  });
  it("compara teléfono con prefijo internacional y correo sin distinguir mayúsculas", () => {
    expect(possibleSameDonor(candidate, { ...values, phone: "0414-123-4567" })).toBe(true);
    expect(possibleSameDonor(candidate, { ...values, email: " CONTACTO@TOQUITOS.TEST " })).toBe(true);
  });
  it("no asocia nombres distintos solo porque ambos incluyen Empresa", () => {
    expect(possibleSameDonor(candidate, { ...values, full_name: "Empresa Almendras" })).toBe(false);
  });
});
