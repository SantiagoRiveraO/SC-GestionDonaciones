import Link from "next/link";
import { DonationForm } from "@/components/donation-form";

export default function NewDonationPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-10">
      <div className="space-y-1">
        <Link
          href="/donations"
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← Volver al listado
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Nueva donación</h1>
        <p className="text-sm text-zinc-600">
          Alta de donación. Persistencia local de prototipo hasta MUN-11.
        </p>
      </div>
      <DonationForm mode="create" />
    </main>
  );
}
