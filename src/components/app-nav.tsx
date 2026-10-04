"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CirclePlus, House, List } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

const items = [
  { href: "/", label: "Inicio", icon: House, primary: false },
  { href: "/donations", label: "Donaciones", icon: List, primary: false },
  {
    href: "/donations/new",
    label: "Registrar donación",
    icon: CirclePlus,
    primary: true,
  },
] as const;

function isNavActive(href: string, pathname: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/donations/new") {
    return pathname === "/donations/new" || pathname.startsWith("/donations/new/");
  }

  return (
    pathname === "/donations" ||
    (pathname.startsWith("/donations/") && !pathname.startsWith("/donations/new"))
  );
}

export function AppNav({ variant }: { variant: "desktop" | "mobile" }) {
  const pathname = usePathname();

  if (variant === "mobile") {
    return (
      <nav
        aria-label="Principal"
        className="fixed right-0 bottom-0 left-0 z-40 border-t border-zinc-200 bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(24,24,27,0.08)] md:hidden"
      >
        <ul className="mx-auto grid max-w-6xl grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.href, pathname);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-[64px] flex-col items-center justify-center gap-1 border-t-[3px] px-2 text-center leading-tight ${focusRing} ${
                    active
                      ? "border-brand font-bold text-brand"
                      : "border-transparent text-ink"
                  }`}
                >
                  <Icon aria-hidden className="size-6" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Principal"
      className="hidden flex-1 items-center justify-center gap-2 md:flex"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = isNavActive(item.href, pathname);

        if (item.primary) {
          return (
            <ButtonLink
              key={item.href}
              href={item.href}
              variant="primary"
              icon={<Icon aria-hidden className="size-5" />}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "shadow-[inset_0_-3px_0_0_var(--brand-contrast)]"
                  : undefined
              }
            >
              {item.label}
            </ButtonLink>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-[48px] items-center gap-2 rounded-md border-b-[3px] px-3 ${focusRing} ${
              active
                ? "border-brand font-bold text-brand"
                : "border-transparent font-medium text-ink hover:text-brand"
            }`}
          >
            <Icon aria-hidden className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
