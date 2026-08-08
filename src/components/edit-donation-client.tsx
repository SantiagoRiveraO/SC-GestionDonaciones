"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { DonationForm } from "@/components/donation-form";
import {
  getDonation,
  getDonationsServerSnapshot,
  getDonationsSnapshot,
  subscribeDonations,
} from "@/lib/donations/prototype-store";

type EditDonationClientProps = {
  donationId: string;
};

export function EditDonationClient({ donationId }: EditDonationClientProps) {
  useSyncExternalStore(
    subscribeDonations,
    getDonationsSnapshot,
    getDonationsServerSnapshot,
  );
  const donation = getDonation(donationId);

  if (donation === null) {
    return (
      <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-8 text-center">
        <p className="text-sm text-zinc-600">No se encontró esta donación.</p>
        <Link
          href="/donations"
          className="inline-block text-sm font-medium text-zinc-900 hover:underline"
        >
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <DonationForm mode="edit" donationId={donation.id} initial={donation} />
  );
}
