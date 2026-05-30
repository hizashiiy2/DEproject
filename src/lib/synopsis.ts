import type { SynopsisInput } from "@/lib/schemas";

/**
 * Renders a saved synopsis as a clean, 1-page Markdown document ready to
 * copy, print, or export as `.md`. Pure so the output can be unit-tested.
 */
export function buildSynopsisMarkdown(data: SynopsisInput): string {
  const lines: string[] = [];
  lines.push(`# ${data.title}`);
  lines.push("");
  lines.push(data.description);
  lines.push("");
  lines.push("## Chosen course topics");
  lines.push(`1. ${data.topicOne}`);
  lines.push(`2. ${data.topicTwo}`);
  lines.push("");
  lines.push("## Main prototype features");
  lines.push(...toBulletList(data.features));
  lines.push("");
  lines.push("## Technologies used");
  lines.push(...toBulletList(data.technologies));

  if (data.githubUrl && data.githubUrl.trim().length > 0) {
    lines.push("");
    lines.push("## Source & deployment");
    lines.push(data.githubUrl.trim());
  }

  if (data.reflection && data.reflection.trim().length > 0) {
    lines.push("");
    lines.push("## Reflection");
    lines.push(data.reflection.trim());
  }

  return lines.join("\n");
}

/**
 * Splits free text into Markdown bullets. Each non-empty line (or comma-separated
 * item on a single line) becomes one bullet, so the form accepts either style.
 */
function toBulletList(raw: string): string[] {
  const byLine = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const items =
    byLine.length > 1
      ? byLine
      : raw
          .split(",")
          .map((part) => part.trim())
          .filter((part) => part.length > 0);

  return items.map((item) => `- ${item.replace(/^[-*]\s*/, "")}`);
}
