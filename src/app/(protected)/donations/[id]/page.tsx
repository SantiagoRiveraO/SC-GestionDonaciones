import Link from "next/link";
import { notFound } from "next/navigation";
import { DonationDetail } from "@/components/donation-detail";
import { StatusMessage } from "@/components/status-message";
import { getDonation } from "@/lib/donations/queries";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

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
      <div className="space-y-1">
        <Link
          href="/donations"
          className={`inline-block rounded-sm text-sm text-zinc-600 hover:text-zinc-900 ${focusRing}`}
        >
          ← Volver al listado
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Detalle de donación
        </h1>
      </div>
      <StatusMessage estado={estado} />
      <DonationDetail donation={donation} />
    </main>
  );
}
