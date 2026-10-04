"use client";

import { useActionState, useRef } from "react";
import { Trash2 } from "lucide-react";
import { deleteDonation } from "@/lib/donations/actions";
import { Button } from "@/components/ui/button";

type DeleteDonationButtonProps = {
  donationId: string;
  amountLabel: string;
  dateLabel: string;
};

export function DeleteDonationButton({
  donationId,
  amountLabel,
  dateLabel,
}: DeleteDonationButtonProps) {
  const [state, formAction, pending] = useActionState(deleteDonation, null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function openDialog() {
    const dialog = dialogRef.current;
    dialog?.showModal();
    dialog?.querySelector<HTMLButtonElement>("[data-cancel]")?.focus();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="danger"
        icon={<Trash2 aria-hidden className="size-5" />}
        onClick={openDialog}
      >
        Eliminar
      </Button>

      <dialog
        ref={dialogRef}
        onClose={() => triggerRef.current?.focus()}
        className="m-auto w-[min(calc(100%-2rem),28rem)] rounded-[12px] border border-zinc-200 bg-surface p-6 text-ink shadow-[0_8px_24px_rgba(24,24,27,0.16)] backdrop:bg-black/50"
      >
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={donationId} />
          <h2 className="text-[30px] leading-tight font-bold">
            ¿Eliminar esta donación?
          </h2>
          <p className="text-lg font-bold">
            {amountLabel} · {dateLabel}
          </p>
          <p>No se podrá recuperar.</p>
          {state?.formError ? (
            <p role="alert" className="font-medium text-red-700">
              {state.formError}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Button type="submit" variant="danger" loading={pending}>
              {pending ? "Eliminando…" : "Sí, eliminar"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              data-cancel
              autoFocus
              onClick={closeDialog}
            >
              No, volver
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
