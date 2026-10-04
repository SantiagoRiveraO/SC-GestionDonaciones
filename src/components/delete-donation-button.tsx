"use client";

import { useActionState } from "react";
import { deleteDonation } from "@/lib/donations/actions";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

type DeleteDonationButtonProps = {
  donationId: string;
};

export function DeleteDonationButton({ donationId }: DeleteDonationButtonProps) {
  const [state, formAction, pending] = useActionState(deleteDonation, null);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "¿Eliminar esta donación? Esta acción no se puede deshacer.",
        );
        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={donationId} />
      <button
        type="submit"
        disabled={pending}
        className={`rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
      >
        {pending ? "Eliminando…" : "Eliminar"}
      </button>
      {state?.formError ? (
        <p
          role="alert"
          className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.formError}
        </p>
      ) : null}
    </form>
  );
}
