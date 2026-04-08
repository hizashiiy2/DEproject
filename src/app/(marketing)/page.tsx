import Link from "next/link";
import { AcademicBreadcrumb } from "@/app/components/AcademicBreadcrumb";
import { MaterialIcon } from "@/app/components/MaterialIcon";

const heroImg =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuClzvT9a2TrlZ5UiFNSTZiB_agYGjgvAu-BMKmwSEGeat6-nxaXX-RdNUBWx9QVUxtSN3MP_gIDvKzcHj1arjn0pGdvNNq7Ny0SeH_ieRD23HbZRArLuoL8r5A44ZB9DtVyXSrvc8chJQr_Jst6pTYcTii9Gnxk5ZEhziCISMB0IUhXw-lxGU-jZdV_twZ4uYrfkkd0_ADqYFuAckJSh2bd6PqaqaMuqQMrqeLIb5HzUne0LQ8Moxr7bl0Uc96gzT4TE-ky7ZRXjm4";
const insightImg =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC4_IbslQ3tvCCtd5dyyVVfDiZYP5Ff3ELg-GXBVEz6jOQygsByadcpXJkRlXkAlq7RXfA29bC6ugvTsyhr4L3snnMGgeALsz9WYx0fKcgcS01FTtRFQUu_OPgkOW0hMcs34h5uI_45c_MeD_pmJOV9IQFdV8goYtph4ij_N0GgsAr6d5y79ZM2b8BnxMQLe5m4popwOewduTC7vfP1-HIdk4DzzRHuB-JL01Q-5ftVxhbWnrxjOuNyfd7mqEJi3zq1-LWOK-Hg0hQ";

export default function LandingPage() {
  return (
    <div className="bg-surface text-on-surface">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-surface px-6 transition-colors">
        <div className="flex items-center gap-8">
          <span className="font-headline text-xl font-bold tracking-tight text-on-surface">DEproject</span>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/dashboard"
              className="font-headline flex h-16 items-center border-b-2 border-primary font-bold tracking-tight text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/presentations"
              className="font-headline rounded-md px-3 py-1 tracking-tight text-on-surface-variant transition hover:bg-surface-container"
            >
              Presentations
            </Link>
            <Link
              href="/analytics"
              className="font-headline rounded-md px-3 py-1 tracking-tight text-on-surface-variant transition hover:bg-surface-container"
            >
              Analytics
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface-container"
            aria-label="Notifications"
          >
            <MaterialIcon name="notifications" />
          </button>
          <div className="h-8 w-8 overflow-hidden rounded-full bg-surface-container-high" aria-hidden />
        </div>
      </header>

      <main className="pb-28 pt-24 md:pb-12">
        <div className="mx-auto mb-8 max-w-7xl px-6">
          <AcademicBreadcrumb
            variant="pill"
            pillAccent="first"
            items={[
              { label: "DEproject", href: "/" },
              { label: "Home" },
              { label: "Landing" },
            ]}
          />
        </div>

        <section className="mx-auto mb-24 grid max-w-7xl items-center gap-12 px-6 md:grid-cols-12">
          <div className="pr-4 md:col-span-7">
            <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-on-surface md:text-7xl font-headline">
              Master Your Next <span className="text-primary italic">Presentation</span>
            </h1>
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-on-surface-variant font-body">
              A sophisticated platform designed for academic excellence. Refine your delivery, manage your
              timing, and perfect your stage presence with data-driven rehearsal tracking.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="academic-gradient tonal-shadow rounded-xl px-8 py-4 text-lg font-bold text-on-primary transition hover:scale-[0.98]"
              >
                Get Started
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold text-primary transition hover:bg-surface-container-low"
              >
                <MaterialIcon name="play_circle" />
                Watch Demo
              </a>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="relative">
              <div className="absolute -left-6 -top-6 -z-10 h-full w-full rounded-xl bg-surface-container-low" />
              <div className="tonal-shadow overflow-hidden rounded-xl bg-surface-container-lowest p-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- external design asset */}
                <img
                  alt=""
                  src={heroImg}
                  className="aspect-[4/3] w-full rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mb-24 max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-12">
            <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-secondary-container/20 to-transparent" />
            <div className="relative z-10 max-w-2xl">
              <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-tertiary">
                Preparation is Key
              </span>
              <h2 className="mb-6 font-headline text-3xl font-bold text-on-surface">Designed for the modern student.</h2>
              <p className="font-body text-lg leading-relaxed text-on-surface-variant">
                DEproject helps you eliminate the anxiety of &quot;winging it.&quot; By breaking your presentation into
                timed segments and logging every rehearsal, you gain a granular understanding of your flow. No
                more running out of time or rushing through your conclusion.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto mb-32 max-w-7xl px-6" id="features">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="mb-2 font-headline text-4xl font-extrabold tracking-tight text-on-surface">
                Refine Every Second
              </h2>
              <p className="font-body text-on-surface-variant">Powerful tools to elevate your academic delivery.</p>
            </div>
            <div className="flex gap-2">
              <div className="h-1 w-12 rounded-full bg-primary" />
              <div className="h-1 w-6 rounded-full bg-outline-variant/30" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: "timer",
                title: "Timed Sections",
                body: "Divide your deck into precise intervals. Set goals for each slide and receive haptic or visual cues when it's time to move on.",
              },
              {
                icon: "history_edu",
                title: "Rehearsal Logs",
                body: "Automatically log every practice session. Note where you stumbled and track improvements in pacing and word clarity over time.",
              },
              {
                icon: "query_stats",
                title: "Progress Tracking",
                body: 'Visual charts show your consistency. See your "readiness score" based on rehearsal frequency and timing accuracy.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group tonal-shadow rounded-xl bg-surface-container-lowest p-8 transition-all hover:-translate-y-2"
              >
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-container-low transition group-hover:bg-primary-container group-hover:text-on-primary-container">
                  <MaterialIcon name={f.icon} className="text-3xl" />
                </div>
                <h3 className="mb-4 font-headline text-xl font-bold text-on-surface">{f.title}</h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mb-24 max-w-7xl px-6">
          <div className="flex flex-col items-center rounded-xl bg-surface-container-low p-1 md:flex-row">
            <div className="w-full p-8 md:w-1/2 md:p-12">
              <div className="mb-6 inline-block rounded-full bg-tertiary-fixed px-3 py-1 text-[10px] font-black uppercase tracking-wider text-on-tertiary-fixed-variant">
                Insight
              </div>
              <h3 className="mb-4 font-headline text-2xl font-bold text-on-surface">Did you know?</h3>
              <p className="font-body text-lg italic leading-relaxed text-on-surface-variant">
                &quot;Practicing a presentation aloud just 3 times increases confidence and significantly reduces
                filler words like &apos;um&apos; and &apos;ah&apos; by 40%.&quot;
              </p>
            </div>
            <div className="relative h-64 w-full overflow-hidden rounded-lg md:h-80 md:w-1/2">
              {/* eslint-disable-next-line @next/next/no-img-element -- external design asset */}
              <img alt="" src={insightImg} className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>
        </section>
      </main>

      <Link
        href="/presentations/new"
        className="academic-gradient fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center gap-3 rounded-2xl shadow-xl transition hover:scale-105 md:bottom-8 md:right-8 md:h-auto md:w-auto md:px-6 md:py-3"
        aria-label="New presentation"
      >
        <MaterialIcon name="add" filled className="text-on-primary" />
        <span className="hidden font-bold text-on-primary md:inline">New presentation</span>
      </Link>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-outline-variant/10 bg-surface-container-lowest px-6 py-3 md:hidden">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-primary">
          <MaterialIcon name="dashboard" filled />
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link href="/presentations" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <MaterialIcon name="present_to_all" />
          <span className="text-[10px]">Library</span>
        </Link>
        <Link href="/analytics" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <MaterialIcon name="analytics" />
          <span className="text-[10px]">Stats</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <MaterialIcon name="settings" />
          <span className="text-[10px]">Settings</span>
        </Link>
      </nav>

      <footer className="bg-surface-container px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 md:flex-row">
          <div>
            <span className="mb-4 block font-headline text-xl font-bold text-on-surface">DEproject</span>
            <p className="max-w-xs text-sm text-on-surface-variant">
              Elevating academic communication through technology and structured preparation.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Platform</span>
              <Link href="/dashboard" className="text-sm text-on-surface-variant hover:text-primary">
                Dashboard
              </Link>
              <Link href="/presentations" className="text-sm text-on-surface-variant hover:text-primary">
                Presentations
              </Link>
              <Link href="/analytics" className="text-sm text-on-surface-variant hover:text-primary">
                Analytics
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Resources</span>
              <span className="text-sm text-on-surface-variant/70">Guidebook</span>
              <span className="text-sm text-on-surface-variant/70">Tutorials</span>
              <span className="text-sm text-on-surface-variant/70">Feedback</span>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-7xl items-center justify-between border-t border-outline-variant/10 pt-8 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          <span>© {new Date().getFullYear()} DEproject Academic</span>
          <div className="flex gap-6">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
