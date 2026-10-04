import { FileQuestion, House } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-full items-center justify-center bg-page px-4 py-12">
      <Card className="flex w-full max-w-md flex-col items-center gap-4 px-5 py-10 text-center">
        <FileQuestion aria-hidden className="size-12 text-accent" />
        <p className="text-lg text-ink">No encontramos esta página.</p>
        <ButtonLink href="/" icon={<House aria-hidden className="size-5" />}>
          Ir al inicio
        </ButtonLink>
      </Card>
    </main>
  );
}
