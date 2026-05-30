"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon, type IconName } from "@/components/MaterialIcon";

type NavItem = { href: string; label: string; icon: IconName; mobileLabel?: string };

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/presentations", label: "Presentations", icon: "present_to_all", mobileLabel: "Library" },
  { href: "/calendar", label: "Calendar", icon: "calendar_month" },
  { href: "/progress", label: "Progress", icon: "monitoring", mobileLabel: "Stats" },
  { href: "/synopsis", label: "Synopsis", icon: "history_edu" },
];

function navClass(active: boolean) {
  return active
    ? "flex items-center gap-3 rounded-lg bg-surface-container-lowest py-3 pl-4 pr-3 text-sm font-semibold text-primary tonal-depth"
    : "flex items-center gap-3 rounded-lg py-3 pl-4 pr-3 text-sm text-on-surface-variant transition-colors hover:text-primary";
}

function itemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFocusTask =
    pathname.endsWith("/rehearse") ||
    pathname.endsWith("/present") ||
    pathname.endsWith("/print");

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
            New presentation
          </Link>
        </div>
      </aside>

      <div className="relative isolate flex min-h-screen flex-1 flex-col md:ml-64">
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
