"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      icon={<LogOut aria-hidden className="size-5" />}
      onClick={handleLogout}
      loading={loading}
      aria-label="Cerrar sesión"
      className="whitespace-nowrap"
    >
      {loading ? "Cerrando…" : "Salir"}
    </Button>
  );
}
