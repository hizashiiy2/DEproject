import { AppShell } from "@/app/components/AppShell";
import { ensureDynamicDb } from "@/lib/ensure-dynamic-db";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await ensureDynamicDb();
  return <AppShell>{children}</AppShell>;
}
