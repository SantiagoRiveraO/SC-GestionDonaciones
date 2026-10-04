import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { forwardRef, type ComponentProps, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "lg";

type ButtonSharedProps = {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function buttonClassName({
  variant,
  size,
  className,
}: {
  variant: Variant;
  size: Size;
  className?: string;
}) {
  return cx(
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 font-bold",
    focusRing,
    size === "lg" ? "min-h-[56px]" : "min-h-[48px]",
    variant === "primary" &&
      "bg-brand text-brand-contrast hover:bg-brand-strong",
    variant === "secondary" &&
      "border-2 border-zinc-300 bg-surface text-ink hover:bg-page",
    variant === "danger" && "bg-red-700 text-white hover:bg-red-800",
    variant === "ghost" && "bg-transparent text-ink hover:bg-brand-soft",
    "disabled:cursor-not-allowed disabled:opacity-60",
    className,
  );
}

function ButtonContent({
  icon,
  loading,
  children,
}: {
  icon?: ReactNode;
  loading: boolean;
  children: ReactNode;
}) {
  return (
    <>
      {loading ? (
        <LoaderCircle aria-hidden className="size-5 animate-spin" />
      ) : (
        icon
      )}
      {children}
    </>
  );
}

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonSharedProps & Omit<ComponentProps<"button">, "children">
>(function Button(
  {
    variant = "primary",
    size = "md",
    icon,
    loading = false,
    disabled,
    className,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClassName({ variant, size, className })}
      {...props}
    >
      <ButtonContent icon={icon} loading={loading}>
        {children}
      </ButtonContent>
    </button>
  );
});

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  className,
  children,
  ...props
}: ButtonSharedProps & Omit<ComponentProps<typeof Link>, "children">) {
  return (
    <Link
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      tabIndex={loading ? -1 : undefined}
      className={cx(
        buttonClassName({ variant, size, className }),
        loading && "pointer-events-none opacity-60",
      )}
      {...props}
    >
      <ButtonContent icon={icon} loading={loading}>
        {children}
      </ButtonContent>
    </Link>
  );
}
