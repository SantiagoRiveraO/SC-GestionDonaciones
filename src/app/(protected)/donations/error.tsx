"use client";

import { House, RotateCw, TriangleAlert } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DonationsError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8 sm:px-6 sm:py-10">
      <Card className="flex flex-col items-center gap-4 px-5 py-10 text-center">
        <TriangleAlert aria-hidden className="size-12 text-accent" />
        <p className="text-lg text-ink">No se pudieron cargar las donaciones.</p>
        <Button
          type="button"
          icon={<RotateCw aria-hidden className="size-5" />}
          onClick={() => retry()}
        >
          Reintentar
        </Button>
        <ButtonLink
          href="/"
          variant="secondary"
          icon={<House aria-hidden className="size-5" />}
        >
          Volver al inicio
        </ButtonLink>
      </Card>
    </main>
  );
}
