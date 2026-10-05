"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesCombined, CirclePlus, House, List, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand";

const items = [
  { href: "/", label: "Inicio", icon: House, primary: false },
  { href: "/donations", label: "Donaciones", icon: List, primary: false },
  { href: "/donors", label: "Donantes", icon: Users, primary: false },
  { href: "/summary", label: "Resumen", icon: ChartNoAxesCombined, primary: false },
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
  if (href === "/donors") return pathname === "/donors" || pathname.startsWith("/donors/");
  if (href === "/summary") return pathname === "/summary";

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
        className="fixed right-0 bottom-0 left-0 z-40 border-t border-zinc-300 bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(24,24,27,0.08)] xl:hidden"
      >
        <ul className="mx-auto grid max-w-6xl grid-cols-[0.65fr_1.3fr_1.05fr_1.05fr_1fr] sm:grid-cols-5">
          {[items[0], items[1], items[4], items[2], items[3]].map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.href, pathname);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-label={item.primary ? "Registrar donación" : undefined}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-[64px] flex-col items-center justify-center gap-1 overflow-visible border-t-[3px] px-0.5 text-center leading-none ${focusRing} ${
                    active
                      ? "border-brand font-bold text-brand"
                      : "border-transparent text-ink"
                  }`}
                >
                  <span className={item.primary ? "rounded-lg bg-brand px-2 py-1 text-white" : active ? "rounded-lg bg-brand-soft px-2 py-1" : "px-2 py-1"}><Icon aria-hidden className="size-6" /></span>
                  <span className="text-[14px] leading-none tracking-tight whitespace-nowrap sm:text-[15px]">
                    {item.primary ? "Registrar" : item.label}
                  </span>
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
      className="hidden flex-1 items-center justify-center gap-1 xl:flex"
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
                  ? "whitespace-nowrap shadow-[inset_0_-3px_0_0_var(--brand-contrast)]"
                  : "whitespace-nowrap"
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
            className={`inline-flex min-h-[48px] items-center gap-2 rounded-md border-b-[3px] px-2 whitespace-nowrap ${focusRing} ${
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
