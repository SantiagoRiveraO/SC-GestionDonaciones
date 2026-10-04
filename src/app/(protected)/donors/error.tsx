"use client";

import { RotateCw, TriangleAlert } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DonorsError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10"><Card className="flex flex-col items-center gap-4 px-5 py-10 text-center">
    <TriangleAlert aria-hidden className="size-12 text-accent" /><p className="text-lg text-ink">No se pudieron cargar los donantes.</p>
    <Button onClick={() => retry()} icon={<RotateCw aria-hidden className="size-5" />}>Reintentar</Button>
    <ButtonLink href="/" variant="secondary">Volver al inicio</ButtonLink>
  </Card></main>;
}
