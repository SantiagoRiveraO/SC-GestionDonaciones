"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";

const fieldClassName =
  "w-full min-h-[48px] rounded-lg border border-zinc-500 bg-surface px-3 text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

function safeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}

function toLoginErrorMessage(error: {
  code?: string;
  status?: number;
  name?: string;
}) {
  if (error.code === "invalid_credentials") {
    return "Correo o contraseña incorrectos.";
  }

  if (error.code === "over_request_rate_limit" || error.status === 429) {
    return "Demasiados intentos. Espera un momento y vuelve a intentar.";
  }

  if (error.name === "AuthRetryableFetchError") {
    return "No se pudo conectar con el servidor. Intenta de nuevo.";
  }

  return "No se pudo iniciar sesión.";
}

function PasswordControl({
  id,
  value,
  onChange,
  shown,
  onToggle,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  shown: boolean;
  onToggle: () => void;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}) {
  return (
    <div className="flex min-h-[48px] overflow-hidden rounded-lg border border-zinc-500 bg-surface focus-within:ring-[3px] focus-within:ring-brand">
      <input
        id={id}
        type={shown ? "text" : "password"}
        name="password"
        autoComplete="current-password"
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        className="min-h-[48px] min-w-0 flex-1 bg-transparent px-3 text-ink focus-visible:outline-none"
      />
      <button
        type="button"
        aria-pressed={shown}
        aria-controls={id}
        onClick={onToggle}
        className="inline-flex min-h-[48px] shrink-0 items-center gap-2 px-3 font-bold text-brand focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand"
      >
        {shown ? (
          <EyeOff aria-hidden className="size-5" />
        ) : (
          <Eye aria-hidden className="size-5" />
        )}
        {shown ? "Ocultar" : "Mostrar"}
      </button>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(toLoginErrorMessage(signInError));
        return;
      }

      router.replace(safeNextPath(searchParams.get("next")));
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field id="email" label="Correo electrónico">
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClassName}
        />
      </Field>

      <Field id="password" label="Contraseña">
        <PasswordControl
          value={password}
          onChange={setPassword}
          shown={showPassword}
          onToggle={() => setShowPassword((open) => !open)}
        />
      </Field>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Button type="submit" size="lg" loading={loading} className="w-full">
        {loading ? "Entrando…" : "Entrar"}
      </Button>

      <p className="text-center text-ink-soft">
        ¿Problemas para entrar? Pide ayuda a quien administra el sistema.
      </p>
    </form>
  );
}
