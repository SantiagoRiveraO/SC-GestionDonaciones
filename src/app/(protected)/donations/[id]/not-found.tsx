import { FileQuestion, List } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DonationNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col px-4 py-8 sm:px-6 sm:py-10">
      <Card className="flex flex-col items-center gap-4 px-5 py-10 text-center">
        <FileQuestion aria-hidden className="size-12 text-accent" />
        <p className="text-lg text-ink">No se encontró esta donación.</p>
        <ButtonLink
          href="/donations"
          icon={<List aria-hidden className="size-5" />}
        >
          Volver a Donaciones
        </ButtonLink>
      </Card>
    </main>
  );
}
