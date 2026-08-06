/**
 * Contrato de datos mínimo (semana 1).
 * Emilio define/ajusta el esquema en supabase/migrations.
 * Carlos consume estos tipos en la UI.
 *
 * Nota: no hay migración de donaciones históricas.
 * El sistema arranca vacío; seeds solo para pruebas.
 */

export type Profile = {
  id: string;
  full_name: string | null;
  role: "admin" | "staff";
  created_at: string;
  updated_at: string;
};

export type Donor = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Donation = {
  id: string;
  donor_id: string | null;
  amount: number;
  currency: string;
  donated_at: string;
  method: string | null;
  concept: string | null;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};
