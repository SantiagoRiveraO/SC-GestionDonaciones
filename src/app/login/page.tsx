export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="text-sm text-zinc-600">
          Placeholder para Carlos (MUN-7). Conectar con Supabase Auth.
        </p>
      </div>
      <form className="space-y-3 rounded-lg border border-zinc-200 p-4">
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Email</span>
          <input
            type="email"
            className="w-full rounded-md border border-zinc-300 px-3 py-2"
            placeholder="usuario@ejemplo.com"
            disabled
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Contraseña</span>
          <input
            type="password"
            className="w-full rounded-md border border-zinc-300 px-3 py-2"
            disabled
          />
        </label>
        <button
          type="button"
          className="w-full rounded-md bg-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600"
          disabled
        >
          Login (pendiente)
        </button>
      </form>
    </main>
  );
}
