import Link from "next/link";

export default function DonationsPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Donaciones</h1>
          <p className="text-sm text-zinc-600">
            Placeholder para Carlos (MUN-12 / MUN-11). Listado vacío es válido:
            no hay datos históricos.
          </p>
        </div>
        <Link
          href="/donations/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Nueva donación
        </Link>
      </div>

      <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-600">
        No hay donaciones registradas todavía.
      </div>
    </main>
  );
}
