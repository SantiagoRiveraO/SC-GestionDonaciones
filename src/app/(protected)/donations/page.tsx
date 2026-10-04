import Link from "next/link";
import { DonationsList } from "@/components/donations-list";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

export default function DonationsPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Donaciones</h1>
          <p className="text-sm text-zinc-600">
            Listado vacío al inicio: no hay donaciones históricas que mostrar.
          </p>
        </div>
        <Link
          href="/donations/new"
          className={`inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 sm:w-auto ${focusRing}`}
        >
          Nueva donación
        </Link>
      </div>

      <DonationsList />
    </main>
  );
}
