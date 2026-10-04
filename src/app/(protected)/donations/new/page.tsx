import Link from "next/link";
import { DonationForm } from "@/components/donation-form";
import { getFilterOptions, listDonorNames } from "@/lib/donations/queries";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

export default async function NewDonationPage() {
  const [donorNames, options] = await Promise.all([
    listDonorNames(),
    getFilterOptions(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-1">
        <Link
          href="/donations"
          className={`inline-block rounded-sm text-sm text-zinc-600 hover:text-zinc-900 ${focusRing}`}
        >
          ← Volver al listado
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Nueva donación</h1>
      </div>
      <DonationForm
        mode="create"
        donorNames={donorNames}
        methods={options.methods}
      />
    </main>
  );
}
