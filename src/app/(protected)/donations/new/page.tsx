import { DonationForm } from "@/components/donation-form";
import { PageHeader } from "@/components/ui/page-header";
import { listDonorNames } from "@/lib/donations/queries";

export default async function NewDonationPage() {
  const donorNames = await listDonorNames();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="Registrar donación"
        backHref="/donations"
        backLabel="Donaciones"
      />
      <DonationForm mode="create" donorNames={donorNames} />
    </main>
  );
}
