import Link from "next/link";
import { AcademicBreadcrumb } from "@/app/components/AcademicBreadcrumb";
import { AiFeaturePlaceholder } from "@/app/components/AiFeaturePlaceholder";
import { MaterialIcon } from "@/app/components/MaterialIcon";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-8 sm:px-8">
      <AcademicBreadcrumb
        items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
      />

      <h1 className="mt-8 font-headline text-2xl font-extrabold text-on-surface">Settings</h1>
      <p className="mt-2 text-on-surface-variant">
        Workspace preferences and data tools for your rehearsal tracker.
      </p>

      <section className="tonal-depth mt-10 rounded-xl bg-surface-container-lowest p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-low text-primary">
          <MaterialIcon name="download" className="text-2xl" />
        </div>
        <h2 className="font-headline text-lg font-bold text-on-surface">Data export</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Download all rehearsal logs as a CSV for spreadsheets or your portfolio evidence.
        </p>
        <a
          href="/api/export/rehearsals"
          download
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition hover:opacity-95"
        >
          <MaterialIcon name="download" className="text-on-primary text-sm" />
          Download rehearsals (.csv)
        </a>
      </section>

      <section className="mt-6 rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low/50 p-6 opacity-70">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <MaterialIcon name="auto_awesome" className="text-xl text-on-surface-variant" />
          <h2 className="font-headline text-lg font-bold text-on-surface-variant">
            Smart assistant &amp; AI coaching
          </h2>
          <AiFeaturePlaceholder label="Disabled" />
        </div>
        <p className="text-sm text-on-surface-variant">
          Suggestions, auto-generated outlines, and conversational feedback are intentionally off for this build. All
          guidance is static or comes from your own rehearsal data.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-surface-container-lowest p-6 tonal-depth">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-low text-primary">
          <MaterialIcon name="settings" className="text-2xl" />
        </div>
        <h2 className="font-headline text-lg font-bold text-on-surface">Account</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          This prototype stores data locally in SQLite (<code className="text-xs">data/app.db</code> by default). There
          is no cloud account or sign-in.
        </p>
        <Link
          href="/presentations"
          className="mt-4 inline-block text-sm font-bold text-primary hover:underline"
        >
          Back to presentations
        </Link>
      </section>
    </div>
  );
}
