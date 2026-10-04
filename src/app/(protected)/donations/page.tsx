import Link from "next/link";
import { DonationsList } from "@/components/donations-list";

export default function DonationsPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Donaciones</h1>
          <p className="text-sm text-zinc-600">
            Listado vacío al inicio: no hay donaciones históricas que mostrar.
          </p>
        </div>
        <Link
          href="/donations/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Nueva donación
        </Link>
      </div>

      <DonationsList />
    </main>
  );
}
