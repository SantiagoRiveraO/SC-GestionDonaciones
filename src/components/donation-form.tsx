"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  createDonation,
  updateDonation,
  type DonationInput,
} from "@/lib/donations/prototype-store";
import type { Donation } from "@/types/database";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function toNullable(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

type DonationFormProps = {
  mode: "create" | "edit";
  donationId?: string;
  initial?: Donation;
};

export function DonationForm({ mode, donationId, initial }: DonationFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState(
    initial ? String(initial.amount) : "",
  );
  const [currency, setCurrency] = useState(initial?.currency ?? "USD");
  const [donatedAt, setDonatedAt] = useState(
    initial?.donated_at ?? todayIsoDate(),
  );
  const [method, setMethod] = useState(initial?.method ?? "");
  const [concept, setConcept] = useState(initial?.concept ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const input: DonationInput = {
      amount: Number(amount),
      currency: currency.trim() || "USD",
      donated_at: donatedAt,
      method: toNullable(method),
      concept: toNullable(concept),
      notes: toNullable(notes),
    };

    if (!Number.isFinite(input.amount) || input.amount < 0) {
      setError("El monto debe ser un número válido mayor o igual a 0.");
      setLoading(false);
      return;
    }

    try {
      if (mode === "create") {
        const created = createDonation(input);
        router.push(`/donations/${created.id}`);
        router.refresh();
        return;
      }

      if (!donationId) {
        setError("Falta el identificador de la donación.");
        return;
      }

      const updated = updateDonation(donationId, input);
      if (!updated) {
        setError("No se encontró la donación a editar.");
        return;
      }

      router.push(`/donations/${updated.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
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

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <p className="text-xs text-zinc-500">
        Prototipo local (localStorage). La integración con Supabase llega en
        MUN-11.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {loading
            ? "Guardando…"
            : mode === "create"
              ? "Crear donación"
              : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() =>
            router.push(
              mode === "edit" && donationId
                ? `/donations/${donationId}`
                : "/donations",
            )
          }
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
