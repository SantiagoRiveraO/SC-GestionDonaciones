"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
          FUNMIAVEN
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Sistema de gestión de donaciones
        </h1>
        <p className="max-w-2xl text-base leading-7 text-zinc-600">
          Panel interno para registrar y consultar donaciones. No hay datos
          históricos: el sistema arranca vacío. Stack: Next.js + Supabase.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/login"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Ir a login
        </Link>
        <Link
          href="/donations"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Ver donaciones
        </Link>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
        <p className="font-medium text-zinc-900">Para el equipo</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Carlos: trabajar en <code>src/</code> (MUN-8 en adelante)
          </li>
          <li>
            Emilio: trabajar en <code>supabase/</code> (MUN-5 en adelante)
          </li>
          <li>
            Guía: <code>README.md</code> y <code>docs/</code>
          </li>
        </ul>
      </section>
    </main>
  );
}
