import { DonationForm } from "@/components/donation-form";
import { PageHeader } from "@/components/ui/page-header";
import { listDonorNames, listSupplyCategories } from "@/lib/donations/queries";
import { getDonor } from "@/lib/donors/queries";

export default async function NewDonationPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const donor = typeof params.donante === "string" ? await getDonor(params.donante) : null;
  const [donorNames, categories] = await Promise.all([listDonorNames(), listSupplyCategories()]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="Registrar donación"
        backHref="/donations"
        backLabel="Donaciones"
      />
      <DonationForm mode="create" donorNames={donorNames} categories={categories} donorName={donor?.full_name ?? undefined} />
    </main>
  );
}
