import { ensureDynamicDb } from "@/lib/ensure-dynamic-db";
import { listRehearsalExportRows } from "@/lib/repository";

function csvCell(v: string): string {
  if (/[",\n\r]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export async function GET() {
  await ensureDynamicDb();
  const rows = listRehearsalExportRows();
  const header = "presentation,run_date,minutes,confidence_1_to_5,notes\n";
  const lines = rows.map(
    (r) =>
      [
        csvCell(r.presentationTitle),
        r.runDate,
        String(r.actualDurationMinutes),
        String(r.confidenceRating),
        csvCell(r.notes ?? ""),
      ].join(","),
  );
  const body = header + lines.join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="deproject-rehearsals.csv"',
    },
  });
}
