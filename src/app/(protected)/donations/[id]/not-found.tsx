import Link from "next/link";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

export default function DonationNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-8 text-center">
        <p className="text-sm text-zinc-600">No se encontró esta donación.</p>
        <Link
          href="/donations"
          className={`inline-block rounded-sm text-sm font-medium text-zinc-900 hover:underline ${focusRing}`}
        >
          Volver al listado
        </Link>
      </div>
    </main>
  );
}
