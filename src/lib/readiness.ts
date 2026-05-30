/**
 * Domain logic for the Project Readiness dashboard.
 *
 * `computeReadiness` turns plain facts about the project (does a synopsis exist,
 * how many topics are chosen, how many rehearsals were logged) into a checklist.
 * Kept pure so the rules — e.g. "synopsis is incomplete if topics are missing" —
 * can be unit-tested without a database or React.
 */

export type ReadinessInput = {
  hasSynopsis: boolean;
  topicCount: number;
  presentationCount: number;
  sectionCount: number;
  rehearsalCount: number;
};

export type ReadinessCheck = {
  id: string;
  label: string;
  done: boolean;
  detail: string;
};
