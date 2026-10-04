import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-full items-center justify-center bg-page px-4 py-12 sm:px-6">
      <Card className="w-full max-w-md space-y-6 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/brand/logo-funmiaven.png"
            alt="FUNMIAVEN"
            width={200}
            height={220}
            priority
            className="h-auto w-44 sm:w-52"
          />
          <h1 className="text-[30px] leading-tight font-bold text-ink">
            Te damos la bienvenida
          </h1>
          <p className="text-ink-soft">
            Acceso para el personal de FUNMIAVEN.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="h-48 animate-pulse rounded-[12px] bg-page" />
          }
        >
          <LoginForm />
        </Suspense>
      </Card>
    </main>
  );
}
