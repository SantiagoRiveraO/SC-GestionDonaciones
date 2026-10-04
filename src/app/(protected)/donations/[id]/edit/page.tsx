import Link from "next/link";
import { notFound } from "next/navigation";
import { DonationForm } from "@/components/donation-form";
import {
  getDonation,
  getFilterOptions,
  listDonorNames,
} from "@/lib/donations/queries";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

type EditDonationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditDonationPage({
  params,
}: EditDonationPageProps) {
  const { id } = await params;
  const [donation, donorNames, options] = await Promise.all([
    getDonation(id),
    listDonorNames(),
    getFilterOptions(),
  ]);

  if (!donation) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-1">
        <Link
          href={`/donations/${id}`}
          className={`inline-block rounded-sm text-sm text-zinc-600 hover:text-zinc-900 ${focusRing}`}
        >
          ← Volver al detalle
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar donación
        </h1>
        <p className="text-sm text-zinc-600">
          Actualiza los datos de la donación seleccionada.
        </p>
      </div>
      <DonationForm
        mode="edit"
        donationId={id}
        initial={donation}
        donorNames={donorNames}
        methods={options.methods}
      />
    </main>
  );
}
