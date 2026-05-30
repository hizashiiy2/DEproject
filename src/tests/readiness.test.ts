import { describe, expect, it } from "vitest";
import { computeReadiness, readinessScore } from "@/lib/readiness";

const fullyReady = {
  hasSynopsis: true,
  topicCount: 2,
  presentationCount: 1,
  sectionCount: 3,
  rehearsalCount: 2,
};

function checkById(input: Parameters<typeof computeReadiness>[0], id: string) {
  const check = computeReadiness(input).find((c) => c.id === id);
  if (!check) throw new Error(`missing check ${id}`);
  return check;
}
