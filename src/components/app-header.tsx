import Image from "next/image";
import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { LogoutButton } from "@/components/logout-button";

const focusRing =
  "rounded-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

export function AppHeader({ displayName }: { displayName: string }) {
  return (
    <>
      <header className="sticky top-0 z-30 bg-surface shadow-[0_2px_8px_rgba(24,24,27,0.08)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2 md:px-6">
          <Link
            href="/"
            className={`flex min-h-[48px] items-center gap-3 ${focusRing}`}
          >
            <Image
              src="/brand/logo-marca.png"
              alt=""
              width={48}
              height={48}
              priority
              unoptimized
            />
            <span className="flex flex-col leading-tight">
              <span className="font-bold text-ink">FUNMIAVEN</span>
              <span className="hidden text-[15px] text-ink-soft md:block">
                Gestión de donaciones
              </span>
            </span>
          </Link>

          <AppNav variant="desktop" />

          <div className="flex items-center gap-3">
            <p className="hidden font-medium text-ink md:block">
              Hola, {displayName}
            </p>
            <LogoutButton />
          </div>
        </div>
      </header>
      <AppNav variant="mobile" />
    </>
  );
}
