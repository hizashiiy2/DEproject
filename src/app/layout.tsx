import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DEproject - Presentation rehearsal",
  description:
    "Refine delivery, manage timing, and track rehearsals with structured preparation.",
};

/** SQLite and server actions require Node; avoid DB access during static generation. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} h-full`}>
      <body className="min-h-full bg-surface font-sans text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed-variant">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
