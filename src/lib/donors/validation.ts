export type DonorValues = { full_name: string; phone: string; email: string; notes: string };
export type DonorFieldErrors = Partial<Record<keyof DonorValues, string>>;

export function parseDonorInput(values: DonorValues) {
  const full_name = values.full_name.trim().replace(/\s+/g, " ");
  const phone = values.phone.trim();
  const email = values.email.trim();
  const notes = values.notes.trim();
  const errors: DonorFieldErrors = {};
  if (!full_name) errors.full_name = "Escribe el nombre de la persona o de la organización.";
  else if (full_name.length > 200) errors.full_name = "Usa un nombre de hasta 200 caracteres.";
  if (phone.length > 40) errors.phone = "Usa un teléfono de hasta 40 caracteres.";
  if (email && (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    errors.email = "Revisa el correo. Ejemplo: nombre@correo.com";
  }
  if (notes.length > 2000) errors.notes = "Las notas pueden tener hasta 2000 caracteres.";
  if (Object.keys(errors).length) return { ok: false as const, errors };
  return { ok: true as const, data: { full_name, phone: phone || null, email: email || null, notes: notes || null } };
}
