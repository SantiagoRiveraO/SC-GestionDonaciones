import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

export function AppHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-6">
          <Link
            href="/donations"
            className={`rounded-sm text-sm font-semibold tracking-wide text-zinc-900 ${focusRing}`}
          >
            FUNMIAVEN
          </Link>
          <nav aria-label="Principal" className="flex items-center gap-3 text-sm">
            <Link
              href="/donations"
              className={`rounded-sm text-zinc-600 hover:text-zinc-900 ${focusRing}`}
            >
              Donaciones
            </Link>
            <Link
              href="/donations/new"
              className={`rounded-sm text-zinc-600 hover:text-zinc-900 ${focusRing}`}
            >
              Nueva
            </Link>
          </nav>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
