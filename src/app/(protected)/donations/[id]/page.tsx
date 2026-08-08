import Link from "next/link";
import { DonationDetail } from "@/components/donation-detail";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

type DonationDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DonationDetailPage({
  params,
}: DonationDetailPageProps) {
  const { id } = await params;

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
      <DonationDetail donationId={id} />
    </main>
  );
}
