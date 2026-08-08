"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  getDonation,
  getDonationsServerSnapshot,
  getDonationsSnapshot,
  removeDonation,
  subscribeDonations,
} from "@/lib/donations/prototype-store";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

type DonationDetailProps = {
  donationId: string;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-zinc-100 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-zinc-500">{label}</dt>
      <dd className="text-sm text-zinc-900">{value}</dd>
    </div>
  );
}

export function DonationDetail({ donationId }: DonationDetailProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  useSyncExternalStore(
    subscribeDonations,
    getDonationsSnapshot,
    getDonationsServerSnapshot,
  );
  const donation = getDonation(donationId);

  if (donation === null) {
    return (
      <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-8 text-center">
        <p className="text-sm text-zinc-600">No se encontró esta donación.</p>
        <Link
          href="/donations"
          className={`inline-block rounded-sm text-sm font-medium text-zinc-900 hover:underline ${focusRing}`}
        >
          Volver al listado
        </Link>
      </div>
    );
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "¿Eliminar esta donación? Esta acción no se puede deshacer en el prototipo.",
    );
    if (!confirmed) return;

    setDeleting(true);
    const ok = removeDonation(donationId);
    if (!ok) {
      setDeleting(false);
      window.alert("No se pudo eliminar la donación.");
      return;
    }
    router.push("/donations");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <dl className="rounded-lg border border-zinc-200 px-4">
        <DetailRow label="Fecha" value={donation.donated_at} />
        <DetailRow
          label="Monto"
          value={`${donation.amount.toFixed(2)} ${donation.currency}`}
        />
        <DetailRow label="Método" value={donation.method || "—"} />
        <DetailRow label="Concepto" value={donation.concept || "—"} />
        <DetailRow label="Notas" value={donation.notes || "—"} />
        <DetailRow
          label="Actualizado"
          value={new Date(donation.updated_at).toLocaleString("es")}
        />
      </dl>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link
          href={`/donations/${donation.id}/edit`}
          className={`inline-flex items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 ${focusRing}`}
        >
          Editar
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className={`rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
        >
          {deleting ? "Eliminando…" : "Eliminar"}
        </button>
        <Link
          href="/donations"
          className={`inline-flex items-center justify-center rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 ${focusRing}`}
        >
          Volver
        </Link>
      </div>
    </div>
  );
}
