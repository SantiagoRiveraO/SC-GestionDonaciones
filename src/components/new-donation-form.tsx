"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function NewDonationForm() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [donatedAt, setDonatedAt] = useState(todayIsoDate);
  const [method, setMethod] = useState("");
  const [concept, setConcept] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    // Prototipo MUN-7: UI navegable sin persistencia (MUN-11/MUN-12).
    await new Promise((resolve) => setTimeout(resolve, 300));
    setMessage(
      "Prototipo: el formulario es navegable. La persistencia en Supabase llega en MUN-11.",
    );
    setLoading(false);

    window.setTimeout(() => {
      router.push("/donations");
      router.refresh();
    }, 900);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-zinc-200 p-4"
    >
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Monto</span>
        <input
          type="number"
          name="amount"
          min="0"
          step="0.01"
          required
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          placeholder="0.00"
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Moneda</span>
        <input
          type="text"
          name="currency"
          required
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Fecha de donación</span>
        <input
          type="date"
          name="donated_at"
          required
          value={donatedAt}
          onChange={(event) => setDonatedAt(event.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Método</span>
        <input
          type="text"
          name="method"
          value={method}
          onChange={(event) => setMethod(event.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          placeholder="Transferencia, efectivo…"
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Concepto</span>
        <input
          type="text"
          name="concept"
          value={concept}
          onChange={(event) => setConcept(event.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Notas</span>
        <textarea
          name="notes"
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
        />
      </label>

      {message ? (
        <p
          role="status"
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {loading ? "Guardando…" : "Guardar (prototipo)"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/donations")}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
