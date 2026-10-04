import { Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DonorNotFound() {
  return <main className="mx-auto w-full max-w-xl px-4 py-8"><Card className="flex flex-col items-center gap-4 px-5 py-10 text-center">
    <Users aria-hidden className="size-12 text-accent" /><h1 className="text-2xl font-bold text-ink">No encontramos este donante</h1>
    <p className="text-ink-soft">Vuelve al registro para buscarlo por su nombre.</p><ButtonLink href="/donors">Volver a Donantes</ButtonLink>
  </Card></main>;
}
