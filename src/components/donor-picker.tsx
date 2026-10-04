"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { findDonors, registerDonorForDonation } from "@/lib/donors/selection-actions";
import type { DonorOption } from "@/lib/donors/selection";
import type { DonorFieldErrors } from "@/lib/donors/validation";

const control = "min-h-[48px] w-full rounded-lg border border-zinc-500 bg-surface px-3 text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

export function DonorPicker({ id, name, mode: initialMode, initial, error: serverError, onBusyChange, onSelectionChange }: {
  id: string; name: string; mode: string; initial?: DonorOption; error?: string;
  onBusyChange: (busy: boolean) => void;
  onSelectionChange: (donor: DonorOption) => void;
}) {
  const [mode, setMode] = useState(initialMode);
  const [selected, setSelected] = useState<DonorOption | null>(id ? initial?.id === id ? initial : { id, full_name: name, phone: null, email: null } : null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DonorOption[]>([]);
  const [searched, setSearched] = useState(false);
  const [more, setMore] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [values, setValues] = useState({ full_name: "", phone: "", email: "" });
  const [errors, setErrors] = useState<DonorFieldErrors>({});
  const [matches, setMatches] = useState<DonorOption[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const error = mode === initialMode && (selected?.id ?? "") === id ? serverError : undefined;
  useEffect(() => { onBusyChange(pending || creating); return () => onBusyChange(false); }, [pending, creating, onBusyChange]);

  function choose(donor: DonorOption) {
    onSelectionChange(donor);
    setSelected(donor); setMode("registered"); setCreating(false); setMessage(null); setMatches([]);
  }
  async function search() {
    if (pending) return;
    setPending(true); setMessage(null);
    try {
      const result = await findDonors(query);
      setResults(result.options); setMore(result.more); setMessage(result.error); setSearched(true);
    } catch { setMessage("No se pudieron buscar los donantes. Intenta de nuevo."); }
    finally { setPending(false); }
  }
  async function create() {
    if (pending) return;
    setPending(true); setMessage(null); setErrors({});
    try {
      const data = new FormData();
      for (const [key, value] of Object.entries(values)) data.set(key, value);
      if (confirmed) data.set("confirm_distinct", "yes");
      const result = await registerDonorForDonation(data);
      if (result.donor) choose(result.donor);
      else { setErrors(result.errors); setMessage(result.error); setMatches(result.matches); }
    } catch { setMessage("No se pudo registrar el donante. Intenta de nuevo."); }
    finally { setPending(false); }
  }
  const optionButton = (donor: DonorOption) => <Button key={donor.id} type="button" variant="secondary" className="w-full flex-col items-start py-3 text-left" disabled={pending} onClick={() => choose(donor)}><span className="break-words">{donor.full_name}</span><span className="break-all text-[16px] font-normal text-ink-soft">{[donor.phone, donor.email].filter(Boolean).join(" · ") || "Sin datos de contacto"}</span><span className="text-[16px]">Seleccionar este donante</span></Button>;

  return <fieldset id="donor_id" className="space-y-3" aria-invalid={Boolean(error) || undefined} aria-describedby={error ? "donor_id-error" : "donor_id-hint"}>
    <legend className="font-bold text-ink">Donante</legend>
    <p id="donor_id-hint" className="text-ink-soft">Elige su ficha para conservar juntas todas sus donaciones.</p>
    <div className="space-y-2">
      {[{ value: "registered", label: "Elegir un donante" }, { value: "anonymous", label: "Sin donante identificado" }].map((choice) => <label key={choice.value} className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg border border-zinc-500 p-3 text-ink has-[:checked]:border-brand has-[:checked]:bg-brand-soft"><input type="radio" name="donor_mode" value={choice.value} checked={mode === choice.value} disabled={pending} onChange={() => { setMode(choice.value); setSelected(null); setMessage(null); setCreating(false); }} className="size-5 shrink-0 accent-brand" />{choice.label}</label>)}
    </div>
    <input type="hidden" name="donor_id" value={mode === "registered" ? selected?.id ?? "" : ""} />
    <input type="hidden" name="donor_name" value={mode === "registered" ? selected?.full_name ?? "" : ""} />
    {mode === "registered" && selected ? <div className="space-y-2 rounded-lg border-2 border-brand bg-brand-soft p-4">
      <p className="font-bold text-ink">Donante seleccionado</p><p className="break-words text-xl font-bold text-brand">{selected.full_name}</p>
      {(selected.phone || selected.email) && <p className="break-all text-ink">{[selected.phone, selected.email].filter(Boolean).join(" · ")}</p>}
      <Button type="button" variant="secondary" onClick={() => { setSelected(null); setQuery(""); setResults([]); setSearched(false); }}>Cambiar donante</Button>
    </div> : mode === "registered" ? <div className="space-y-3">
      {!creating ? <>
        <Field id="donor-query" label="Buscar por nombre, teléfono o correo" hint="Puedes escribir solo una parte del nombre.">
          <input type="search" value={query} disabled={pending} onChange={(event) => { setQuery(event.target.value); setResults([]); setSearched(false); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void search(); } }} className={control} />
        </Field>
        <Button type="button" variant="secondary" loading={pending} onClick={() => void search()}>Buscar donante</Button>
        {searched && !message && <p role="status" className="text-ink-soft">{results.length ? "Selecciona la ficha correcta:" : "No encontramos donantes con esa búsqueda."}</p>}
        <div className="space-y-2">{results.map(optionButton)}</div>
        {more && <p className="text-ink-soft">Hay más coincidencias. Escribe un apellido, teléfono o correo para precisar la búsqueda.</p>}
        <Button type="button" variant="secondary" disabled={pending} onClick={() => { setCreating(true); setValues({ full_name: query, phone: "", email: "" }); setMatches([]); setConfirmed(false); setMessage(null); setErrors({}); }}>Registrar un donante nuevo</Button>
      </> : <div className="space-y-3 rounded-lg border border-zinc-300 p-4" onKeyDown={(event) => { if (event.key === "Enter" && event.target instanceof HTMLInputElement && event.target.type !== "checkbox") { event.preventDefault(); void create(); } }}>
        <p className="font-bold text-ink">Registrar un donante nuevo</p>
        <p className="text-ink-soft">Si dona una empresa, usa su nombre. Comprueba primero que no esté registrada.</p>
        {([{ field: "full_name", label: "Nombre del nuevo donante", type: "text", max: 200 }, { field: "phone", label: "Teléfono del nuevo donante", type: "tel", max: 40 }, { field: "email", label: "Correo del nuevo donante", type: "email", max: 320 }] as const).map((field) => <Field key={field.field} id={`new-donor-${field.field}`} label={field.label} optional={field.field !== "full_name"} error={errors[field.field]}><input type={field.type} value={values[field.field]} disabled={pending} maxLength={field.max} onChange={(event) => { setValues({ ...values, [field.field]: event.target.value }); setConfirmed(false); setMatches([]); }} className={control} /></Field>)}
        {matches.length > 0 && <div className="space-y-3"><p className="font-bold text-ink">¿Es alguno de estos donantes?</p>{matches.map(optionButton)}<label className="flex min-h-[48px] items-center gap-3 text-ink"><input type="checkbox" checked={confirmed} disabled={pending} onChange={(event) => setConfirmed(event.target.checked)} className="size-5 shrink-0 accent-brand" />Revisé la lista: es otro donante.</label></div>}
        <div className="flex flex-col gap-3"><Button type="button" loading={pending} onClick={() => void create()}>Guardar y seleccionar donante</Button><Button type="button" variant="secondary" disabled={pending} onClick={() => { setCreating(false); setMessage(null); }}>Volver a buscar</Button></div>
      </div>}
    </div> : <p className="text-ink-soft">Se guardará sin asociarla a una persona u organización.</p>}
    {message && <p role="alert" className="font-medium text-red-700">{message}</p>}
    {error && <p id="donor_id-error" role="alert" className="font-medium text-red-700">{error}</p>}
  </fieldset>;
}
