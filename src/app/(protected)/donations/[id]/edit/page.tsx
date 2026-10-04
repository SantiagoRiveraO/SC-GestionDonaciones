import { notFound } from "next/navigation";
import { DonationForm } from "@/components/donation-form";
import { PageHeader } from "@/components/ui/page-header";
import { getDonation, listSupplyCategories } from "@/lib/donations/queries";
import { getDonor } from "@/lib/donors/queries";

type EditDonationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditDonationPage({
  params,
}: EditDonationPageProps) {
  const { id } = await params;
  const [donation, categories] = await Promise.all([
    getDonation(id),
    listSupplyCategories(),
  ]);

  if (!donation) {
    notFound();
  }
  const donor = donation.donor_id ? await getDonor(donation.donor_id) : null;
  const selectedDonor = donor?.id && donor.full_name ? { id: donor.id, full_name: donor.full_name, phone: donor.phone, email: donor.email } : undefined;

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
        selectedDonor={selectedDonor}
        categories={categories}
      />
    </main>
  );
}
