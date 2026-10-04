"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { saveCategory } from "@/lib/donations/category-actions";
import type { SupplyCategoryOption } from "@/lib/donations/categories";

const fieldClassName = "min-h-[48px] w-full rounded-lg border border-zinc-500 bg-surface px-3 text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

export function CategoryEditor({ category }: { category?: SupplyCategoryOption }) {
  const [state, action, pending] = useActionState(saveCategory, null);
  return (
    <form action={action} aria-label={category ? `Cambiar nombre de ${category.label}` : "Agregar categoría"} className="space-y-3">
      {category ? <input type="hidden" name="id" value={category.value} /> : null}
      <Field id={`category-name-${category?.value ?? "new"}`} label={category ? "Nombre de categoría" : "Nombre de la nueva categoría"} error={state?.error ?? undefined} hint={!category ? "Ejemplo: Materiales de construcción." : undefined}>
        <input key={state?.name ?? category?.label ?? ""} name="name" type="text" maxLength={80} defaultValue={state?.name ?? category?.label ?? ""} className={fieldClassName} />
      </Field>
      <Button type="submit" variant={category ? "secondary" : "primary"} loading={pending}>
        {pending ? "Guardando…" : category ? "Guardar nombre" : "Agregar categoría"}
      </Button>
      {state?.category ? <p role="status" className="font-medium text-ink">{category ? "Nombre actualizado." : "Categoría agregada."}</p> : null}
    </form>
  );
}

// Dentro del formulario de donación: no anida formularios ni pierde lo escrito.
export function AddCategoryControl({ onCreated, onBusyChange }: { onCreated: (category: SupplyCategoryOption) => void; onBusyChange: (busy: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  useEffect(() => { onBusyChange(pending); return () => onBusyChange(false); }, [pending, onBusyChange]);
  async function add() {
    if (pending) return;
    setPending(true);
    setError(undefined);
    try {
      const data = new FormData();
      data.set("name", name);
      const result = await saveCategory(null, data);
      if (result.category) {
        onCreated({ value: result.category.id, label: result.category.name });
        setName("");
        setOpen(false);
      } else setError(result.error ?? "No se pudo agregar la categoría.");
    } catch {
      setError("No se pudo agregar la categoría. Intenta de nuevo.");
    } finally {
      setPending(false);
    }
  }
  if (!open) return <Button type="button" variant="secondary" onClick={() => setOpen(true)}>Agregar nueva categoría</Button>;
  return (
    <div className="space-y-3 rounded-lg border border-zinc-300 p-3">
      <Field id="inline-category-name" label="Nombre de la nueva categoría" hint="Ejemplo: Materiales de construcción." error={error}>
        <input type="text" value={name} disabled={pending} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void add(); } }} maxLength={80} autoFocus className={fieldClassName} />
      </Field>
      <div className="flex flex-wrap gap-3">
        <Button type="button" loading={pending} onClick={() => void add()}>{pending ? "Agregando…" : "Agregar categoría"}</Button>
        <Button type="button" variant="secondary" disabled={pending} onClick={() => { setOpen(false); setError(undefined); }}>Cancelar</Button>
      </div>
    </div>
  );
}
