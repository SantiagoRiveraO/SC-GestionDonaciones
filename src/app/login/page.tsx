import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-full items-center justify-center bg-page px-4 py-6 sm:px-6 sm:py-12">
      <Card className="w-full max-w-md space-y-5 p-5 sm:space-y-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/brand/logo-funmiaven.png"
            alt="FUNMIAVEN"
            width={176}
            height={198}
            priority
            className="h-auto w-28 sm:w-44"
          />
          <h1 className="text-[26px] leading-tight font-bold text-ink sm:text-[30px]">
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
