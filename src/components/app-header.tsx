import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export function AppHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/donations" className="text-sm font-semibold tracking-wide text-zinc-900">
            FUNMIAVEN
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/donations"
              className="text-zinc-600 hover:text-zinc-900"
            >
              Donaciones
            </Link>
            <Link
              href="/donations/new"
              className="text-zinc-600 hover:text-zinc-900"
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
