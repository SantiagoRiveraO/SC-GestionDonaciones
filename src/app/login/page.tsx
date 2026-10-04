import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-6 px-4 py-12 sm:px-6 sm:py-16">
      <div className="space-y-2">
        <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
          FUNMIAVEN
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="text-sm text-zinc-600">
          Acceso para el personal de FUNMIAVEN.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-600">
            Cargando formulario…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
