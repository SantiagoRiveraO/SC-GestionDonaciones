import { notFound } from "next/navigation";
import { DonorForm } from "@/components/donor-form";
import { PageHeader } from "@/components/ui/page-header";
import { getDonor } from "@/lib/donors/queries";

export default async function EditDonorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const donor = await getDonor(id);
  if (!donor?.id || !donor.full_name) notFound();
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader title="Editar donante" backHref={`/donors/${id}`} backLabel="la ficha" />
      <DonorForm initial={{ id: donor.id, full_name: donor.full_name, phone: donor.phone, email: donor.email, notes: donor.notes }} />
    </main>
  );
}
