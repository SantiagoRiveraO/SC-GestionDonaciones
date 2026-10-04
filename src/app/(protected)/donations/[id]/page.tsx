import { notFound } from "next/navigation";
import { DonationDetail } from "@/components/donation-detail";
import { StatusMessage } from "@/components/status-message";
import { PageHeader } from "@/components/ui/page-header";
import { getDonation } from "@/lib/donations/queries";

type DonationDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DonationDetailPage({
  params,
  searchParams,
}: DonationDetailPageProps) {
  const { id } = await params;
  const { estado } = await searchParams;
  const donation = await getDonation(id);

  if (!donation) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="Detalle de la donación"
        backHref="/donations"
        backLabel="Donaciones"
      />
      <StatusMessage estado={estado} />
      <DonationDetail donation={donation} />
    </main>
  );
}
