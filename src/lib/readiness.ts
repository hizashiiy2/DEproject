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

export type ReadinessScore = {
  completed: number;
  total: number;
  percent: number;
};

export function computeReadiness(input: ReadinessInput): ReadinessCheck[] {
  const topicsSelected = input.hasSynopsis && input.topicCount >= 2;
  return [
    {
      id: "synopsis",
      label: "Synopsis completed",
      done: input.hasSynopsis,
      detail: input.hasSynopsis
        ? "Synopsis saved in the Synopsis Builder."
        : "Fill in and save the synopsis.",
    },
    {
      id: "topics",
      label: "2 course topics selected",
      done: topicsSelected,
      detail: topicsSelected
        ? "Two topics chosen for the presentation."
        : "Select two course topics in the synopsis.",
    },
    {
      id: "presentation",
      label: "Presentation created",
      done: input.presentationCount > 0,
      detail:
        input.presentationCount > 0
          ? `${input.presentationCount} presentation(s) in the library.`
          : "Create a presentation to rehearse.",
    },
    {
      id: "plan",
      label: "Presentation plan created",
      done: input.sectionCount > 0,
      detail:
        input.sectionCount > 0
          ? `${input.sectionCount} section(s) planned.`
          : "Add sections to outline your talk.",
    },
    {
      id: "rehearsal",
      label: "Rehearsal completed",
      done: input.rehearsalCount > 0,
      detail:
        input.rehearsalCount > 0
          ? `${input.rehearsalCount} rehearsal run(s) logged.`
          : "Log at least one rehearsal run.",
    },
  ];
}

export function readinessScore(checks: ReadinessCheck[]): ReadinessScore {
  const total = checks.length;
  const completed = checks.filter((check) => check.done).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}

/**
 * Quality-assurance tooling that ships with the project. These are configured in
 * `package.json` (so they are genuinely "ready"); the command is shown verbatim
 * for the exam's Quality Assurance discussion.
 */
export type QaTool = {
  label: string;
  command: string;
  description: string;
};
