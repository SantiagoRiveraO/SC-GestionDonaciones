import { Button, ButtonLink } from "@/components/ui/button";

export function RecordPagination({ page, pageCount, href }: { page: number; pageCount: number; href: (page: number) => string }) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Paginación" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {page > 1 ? <ButtonLink href={href(page - 1)} variant="secondary">← Anterior</ButtonLink> : <Button variant="secondary" disabled>← Anterior</Button>}
      <p className="text-center font-medium text-ink">Página {page} de {pageCount}</p>
      {page < pageCount ? <ButtonLink href={href(page + 1)} variant="secondary">Siguiente →</ButtonLink> : <Button variant="secondary" disabled>Siguiente →</Button>}
    </nav>
  );
}
