"use client";

import { useState } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import type { PresentationListExtras } from "@/lib/repository";

const DASHBOARD_COVERS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBKV8Uz5V9fArcYV2lzTKaZqFBvInfj3ksBs9ooWJwY9wKk9b8CGkTEx8Rj-MRGYZ3M7esvUGzaB656mhBkAcAFRLh7gcckGCe4gZzovhJHnhGncNNUeorulLlUysO_IdrdhEruaRZAzbKgKLyjYUVpYyJ67vGvJkj1UKzEIXPONBa5eTnLfWnm-NViPOU6HXxGR3NY2icyg75xpdMuTvOfFIG5IuXXCo-Rzi5WzR3ZKU2XTRLBLQ4g-17FgOHxIIYNc_w9YfBKfK4",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBlWQAGHTmUJAm24SOg0WgGYlO6a-ugVkcwm8uERWDOwHpIsCHL3Pp9AaKVo2eWU-HZyyiY4CoPPCERouJWdD2sunhvDN_S5a1DWJUFxMFYQXsVWBVbPBVxqF8ceWWloUBL6KBgI4pjSf1-IE5q-iq6bfvpeSojOKFpy32Pvsq_uUosccJpTErAtlXvEMHsCgBP4ubYOGEoLAJa6GiVCYutdeXUbuTIVyrq4fV2jrTAfk_8q6TTgY-PriPHFS_5o4GTK_DdSzmkdSk",
] as const;

function coverForTitle(title: string): string {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h + title.charCodeAt(i) * (i + 1)) % 997;
  return DASHBOARD_COVERS[h % DASHBOARD_COVERS.length]!;
}

function formatLastPracticed(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(`${iso}T12:00:00`);
  const today = new Date();
  const diffDays = Math.floor(
    (today.setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0)) / 86400000,
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function statusBadge(p: PresentationListExtras): { label: string; className: string } {
  if (p.status === "completed") {
    return { label: "DONE", className: "bg-outline-variant/90 text-on-surface" };
  }
  if (p.status === "draft") {
    return { label: "DRAFT", className: "bg-outline-variant/90 text-on-surface" };
  }
  return {
    label: p.lastPracticed ? "ACTIVE" : "ACTIVE",
    className: p.lastPracticed ? "bg-primary/90 text-on-primary" : "bg-primary/70 text-on-primary",
  };
}

type Props = { presentations: PresentationListExtras[] };

export function DashboardPresentationSection({ presentations }: Props) {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-headline text-2xl font-extrabold text-on-surface">Current presentations</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              view === "grid" ? "bg-surface-container text-on-surface" : "bg-surface-container-low text-on-surface-variant"
            }`}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
          >
            <MaterialIcon name="grid_view" className="text-sm" filled={view === "grid"} />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              view === "list" ? "bg-surface-container text-on-surface" : "bg-surface-container-low text-on-surface-variant opacity-70"
            }`}
            aria-label="List view"
            aria-pressed={view === "list"}
          >
            <MaterialIcon name="list" className="text-sm" filled={view === "list"} />
          </button>
        </div>
      </div>
      <div
        className={
          view === "grid"
            ? "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
            : "flex flex-col gap-4"
        }
      >
        {presentations.map((p) => {
          const cover = coverForTitle(p.title);
          const badge = statusBadge(p);
          const inner = (
            <>
              <div
                className={
                  view === "grid"
                    ? "relative aspect-video w-full overflow-hidden"
                    : "relative h-28 w-40 shrink-0 overflow-hidden sm:h-32 sm:w-48"
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- remote design asset */}
                <img alt="" src={cover} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface/90 to-transparent" />
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                  <span className={`rounded px-2 py-1 text-[10px] font-bold ${badge.className}`}>
                    {badge.label}
                  </span>
                  <span className="rounded bg-surface-container-lowest/90 px-2 py-1 text-[10px] font-bold text-on-surface">
                    {p.sectionCount} SECTIONS
                  </span>
                </div>
              </div>
              <div className={view === "grid" ? "p-6" : "flex min-w-0 flex-1 flex-col justify-center p-4 sm:p-6"}>
                <h4 className="font-headline text-lg font-bold text-on-surface transition group-hover:text-primary">
                  {p.title}
                </h4>
                <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">{p.topic}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-on-surface-variant">
                  <span className="flex items-center gap-1.5">
                    <MaterialIcon name="schedule" className="text-sm" />
                    {String(p.targetDurationMinutes).padStart(2, "0")}:00
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {p.lastPracticed
                      ? `Last · ${formatLastPracticed(p.lastPracticed)}`
                      : "Not rehearsed yet"}
                  </span>
                </div>
              </div>
            </>
          );
          return (
            <Link
              key={p.id}
              href={`/presentations/${p.id}`}
              className={`group tonal-depth flex overflow-hidden rounded-xl bg-surface-container-lowest transition hover:-translate-y-0.5 ${
                view === "list" ? "flex-row" : "flex-col"
              }`}
            >
              {inner}
            </Link>
          );
        })}
        <Link
          href="/presentations/new"
          className="group flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/30 p-8 transition hover:border-primary/40 hover:bg-primary/5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-outline transition group-hover:scale-110">
            <MaterialIcon name="add" />
          </div>
          <div className="mt-4 text-center text-sm font-bold text-on-surface-variant">Create new presentation</div>
          <div className="mt-1 text-center text-xs text-on-surface-variant/60">
            Start from scratch and define section timing.
          </div>
        </Link>
      </div>
    </section>
  );
}
