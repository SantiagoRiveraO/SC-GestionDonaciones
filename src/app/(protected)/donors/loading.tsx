import { Card } from "@/components/ui/card";

export default function DonorsLoading() {
  return <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10" aria-busy="true" aria-label="Cargando donantes">
    <div className="h-8 w-48 animate-pulse rounded-lg bg-brand-soft" />
    <Card className="h-48 animate-pulse bg-surface" />
    <Card className="h-28 animate-pulse bg-surface" />
    <Card className="h-28 animate-pulse bg-surface" />
  </main>;
}
