export type SupplyCategory = string;
export type SupplyCategoryOption = { value: string; label: string };

export function parseSupplyCategory(value: unknown): SupplyCategory | null {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(value) ? value : null;
}

export function categoryNameError(name: string): string | null {
  if (!name.trim()) return "Escribe el nombre de la categoría. Ejemplo: Materiales de construcción.";
  if (name.trim().length > 80) return "Usa un nombre de hasta 80 caracteres.";
  return null;
}
