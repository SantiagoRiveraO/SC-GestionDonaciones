export default function NewDonationPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-xl flex-col gap-6 px-6 py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Nueva donación</h1>
        <p className="text-sm text-zinc-600">
          Placeholder de formulario (Carlos). Conectar al CRUD de Supabase.
        </p>
      </div>
      <form className="space-y-3 rounded-lg border border-zinc-200 p-4">
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Monto</span>
          <input
            type="number"
            className="w-full rounded-md border border-zinc-300 px-3 py-2"
            placeholder="0.00"
            disabled
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Concepto</span>
          <input
            type="text"
            className="w-full rounded-md border border-zinc-300 px-3 py-2"
            disabled
          />
        </label>
        <button
          type="button"
          className="rounded-md bg-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600"
          disabled
        >
          Guardar (pendiente)
        </button>
      </form>
    </main>
  );
}
