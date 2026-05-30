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
