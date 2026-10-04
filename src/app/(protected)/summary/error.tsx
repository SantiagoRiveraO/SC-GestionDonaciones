"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
export default function SummaryError({ retry }: { retry: () => void }) {
  return <main className="mx-auto max-w-5xl px-4 py-10"><Card className="space-y-4 p-6"><h1 className="text-2xl font-bold text-ink">No se pudo cargar el resumen</h1><p className="text-ink-soft">Revisa tu conexión e inténtalo de nuevo.</p><Button onClick={retry}>Volver a intentar</Button></Card></main>;
}
