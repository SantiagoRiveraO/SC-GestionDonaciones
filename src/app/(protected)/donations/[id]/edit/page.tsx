import { notFound } from "next/navigation";
import { DonationForm } from "@/components/donation-form";
import { PageHeader } from "@/components/ui/page-header";
import { getDonation, listDonorNames, listSupplyCategories } from "@/lib/donations/queries";

type EditDonationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditDonationPage({
  params,
}: EditDonationPageProps) {
  const { id } = await params;
  const [donation, donorNames, categories] = await Promise.all([
    getDonation(id),
    listDonorNames(),
    listSupplyCategories(),
  ]);

  if (!donation) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="Editar donación"
        backHref={`/donations/${id}`}
        backLabel="la donación"
      />
      <DonationForm
        mode="edit"
        donationId={id}
        initial={donation}
        donorNames={donorNames}
        categories={categories}
      />
    </main>
  );
}
