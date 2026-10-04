import { CategoryEditor } from "@/components/category-editor";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { listSupplyCategories } from "@/lib/donations/queries";

export default async function CategoriesPage() {
  const categories = await listSupplyCategories();
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader title="Administrar categorías" backHref="/donations" backLabel="Donaciones" description="Agrega categorías o cambia sus nombres. Los nombres se actualizan también en las donaciones que ya las usan." />
      <Card className="space-y-4 p-5">
        <h2 className="text-xl font-bold text-ink">Agregar una categoría</h2>
        <CategoryEditor />
      </Card>
      <h2 className="text-xl font-bold text-ink">Cambiar nombres</h2>
      {categories.map((category) => <Card key={category.value} className="p-5"><CategoryEditor category={category} /></Card>)}
    </main>
  );
}
