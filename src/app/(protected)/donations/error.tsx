"use client";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

export default function DonationsError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-8 sm:px-6 sm:py-10">
      <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-600">
        No se pudieron cargar las donaciones.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className={`mx-auto rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 ${focusRing}`}
      >
        Reintentar
      </button>
    </main>
  );
}
