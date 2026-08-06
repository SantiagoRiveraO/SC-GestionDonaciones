/**
 * Lee y valida las variables públicas de Supabase.
 * Falla con un mensaje claro si faltan (evita crashes opacos en runtime).
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Copia .env.example a .env.local y completa los valores del proyecto Supabase.",
    );
  }

  return { url, anonKey };
}
