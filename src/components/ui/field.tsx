import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

type FieldControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

export function Field({
  id,
  label,
  optional = false,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control = isValidElement<FieldControlProps>(children)
    ? cloneElement(children as ReactElement<FieldControlProps>, {
        id,
        "aria-describedby": describedBy,
        "aria-invalid": Boolean(error) || undefined,
      })
    : children;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold text-ink">
        {label}
        {optional ? (
          <span className="font-normal text-ink-soft"> (opcional)</span>
        ) : null}
      </label>
      {control}
      {hint ? (
        <p id={hintId} className="text-ink-soft">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
