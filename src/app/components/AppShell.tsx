"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { AppHeaderSearch } from "@/app/components/AppHeaderSearch";

type NavItem = { href: string; label: string; icon: string; mobileLabel?: string };

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/presentations", label: "Presentations", icon: "present_to_all", mobileLabel: "Library" },
  { href: "/analytics", label: "Analytics", icon: "analytics", mobileLabel: "Stats" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

const HEADER_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDpyRmy7xjUVvvxXXEk7S9s0eCxhI_17-iRHYbEE6HcWMf98aF0HA6oUzV-XGdt_JQdlioRsB0mbJZqRkP_CmvN6-B3nAvtubR7NLjWp6AIB9r3Jloe47LB5AlQxCpuWKii6rfNquY5LC5y-q_CHsLx_YGIKiWUlI4hSYU4Leb5Q62X9eL83NpLXgZJRrRBI6HBrqdJaD5mYMOlBRaJGbeokb52IQBqhFmiPwL9EYy9S9kznjvglPsxO262NcKAc-iJVQu9klI__lc";

function navClass(active: boolean) {
  return active
    ? "flex items-center gap-3 rounded-lg bg-surface-container-lowest py-3 pl-4 pr-3 text-sm font-semibold text-primary tonal-depth"
    : "flex items-center gap-3 rounded-lg py-3 pl-4 pr-3 text-sm text-on-surface-variant transition-colors hover:text-primary";
}

function itemActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/settings") return pathname === "/settings" || pathname.startsWith("/settings/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFocusTask = pathname.includes("/rehearse");

  if (isFocusTask) {
    return <div className="min-h-screen bg-surface">{children}</div>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="tonal-depth fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col gap-4 bg-surface-container-low py-8 pl-4 pr-3 md:flex">
        <div className="mb-2 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary">
            <MaterialIcon name="school" filled />
          </div>
          <div>
            <div className="font-headline text-lg font-black leading-tight text-primary">
              DEproject
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-70">
              Academic Excellence
            </div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 pt-2">
          {navItems.map((item) => {
            const active = itemActive(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} className={navClass(active)}>
                <MaterialIcon name={item.icon} filled={active} />
                <span className="font-headline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-2 pb-2">
          <Link
            href="/presentations/new"
            className="academic-gradient tonal-depth flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-on-primary transition hover:opacity-95"
          >
            <MaterialIcon name="add" className="text-on-primary" />
            New rehearsal
          </Link>
        </div>
      </aside>

      <div className="relative isolate flex min-h-screen flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-outline-variant/10 bg-surface/95 px-4 backdrop-blur-sm sm:px-8">
          <div className="min-w-0 max-w-md flex-1">
            <AppHeaderSearch />
          </div>
          <div className="flex shrink-0 items-center gap-2 pl-3 sm:gap-4 sm:pl-4">
            <button
              type="button"
              disabled
              className="relative flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full text-on-surface-variant opacity-40"
              aria-label="Notifications (not available)"
              title="Notifications are not part of this project scope."
            >
              <MaterialIcon name="notifications" />
            </button>
            <div className="relative hidden h-9 w-9 overflow-hidden rounded-full border border-outline-variant/30 sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote design asset */}
              <img
                src={HEADER_AVATAR}
                alt=""
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </header>
        <div className="relative z-0 flex-1 pb-20 md:pb-0">{children}</div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-outline-variant/10 bg-surface/95 px-2 backdrop-blur-xl md:hidden">
        {navItems.map((item) => {
          const active = itemActive(pathname, item.href);
          const short = item.mobileLabel ?? item.label;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 ${active ? "text-primary" : "text-on-surface-variant"}`}
            >
              <MaterialIcon name={item.icon} filled={active} className="text-[22px]" />
              <span className={`max-w-full truncate text-[9px] ${active ? "font-bold" : "font-medium"}`}>
                {short}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
