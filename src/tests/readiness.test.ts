import { describe, expect, it } from "vitest";
import { computeReadiness, readinessScore } from "@/domain/readiness";

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

describe("computeReadiness", () => {
  it("marks every deliverable ready for a complete project", () => {
    const checks = computeReadiness(fullyReady);
    expect(checks.every((c) => c.done)).toBe(true);
  });

  it("marks the topics check incomplete if topics are missing", () => {
    const missingTopics = checkById({ ...fullyReady, topicCount: 1 }, "topics");
    expect(missingTopics.done).toBe(false);
  });

  it("marks the topics check incomplete if there is no synopsis", () => {
    const noSynopsis = checkById(
      { ...fullyReady, hasSynopsis: false, topicCount: 0 },
      "topics",
    );
    expect(noSynopsis.done).toBe(false);
  });

  it("requires at least one rehearsal", () => {
    expect(checkById({ ...fullyReady, rehearsalCount: 0 }, "rehearsal").done).toBe(false);
  });
});

describe("readinessScore", () => {
  it("reports 100% when everything is done", () => {
    const score = readinessScore(computeReadiness(fullyReady));
    expect(score.completed).toBe(score.total);
    expect(score.percent).toBe(100);
  });

  it("reports a partial percentage", () => {
    const score = readinessScore(
      computeReadiness({
        hasSynopsis: false,
        topicCount: 0,
        presentationCount: 0,
        sectionCount: 0,
        rehearsalCount: 0,
      }),
    );
    expect(score.completed).toBe(0);
    expect(score.percent).toBe(0);
  });
});
