import { DonationForm } from "@/components/donation-form";
import { PageHeader } from "@/components/ui/page-header";
import { listSupplyCategories } from "@/lib/donations/queries";
import { Alert } from "@/components/ui/alert";
import { getDonor } from "@/lib/donors/queries";

export default async function NewDonationPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const donor = typeof params.donante === "string" ? await getDonor(params.donante) : null;
  const categories = await listSupplyCategories();
  const selectedDonor = donor?.id && donor.full_name ? { id: donor.id, full_name: donor.full_name, phone: donor.phone, email: donor.email } : undefined;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="Registrar donación"
        backHref="/donations"
        backLabel="Donaciones"
      />
      {params.donante && !selectedDonor ? <Alert variant="error">Ese donante no está disponible. Busca y selecciona otro donante.</Alert> : null}
      <DonationForm mode="create" categories={categories} selectedDonor={selectedDonor} />
    </main>
  );
}
