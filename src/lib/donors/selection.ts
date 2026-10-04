export type DonorOption = { id: string; full_name: string; phone: string | null; email: string | null };
export function donorWords(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .split(/[^a-z0-9]+/).filter((word) => word.length >= 4 && !["empresa", "fundacion", "asociacion", "corporacion"].includes(word));
}
export function possibleSameDonor(candidate: DonorOption, values: { full_name: string; phone: string; email: string }) {
  if (values.email && candidate.email?.toLowerCase() === values.email.trim().toLowerCase()) return true;
  const phone = values.phone.replace(/\D/g, "").slice(-10);
  if (phone.length >= 7 && candidate.phone?.replace(/\D/g, "").slice(-10) === phone) return true;
  return donorWords(values.full_name).some((word) => donorWords(candidate.full_name).some((other) => word.slice(0, 5) === other.slice(0, 5)));
}
