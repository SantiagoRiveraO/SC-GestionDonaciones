import { DonorForm } from "@/components/donor-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewDonorPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader title="Registrar donante" description="Solo el nombre es obligatorio. Puedes completar los demás datos después." backHref="/donors" backLabel="Donantes" />
      <DonorForm />
    </main>
  );
}
