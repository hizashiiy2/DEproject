import { describe, expect, it } from "vitest";
import {
  EXAM_PHASE_SECONDS,
  computeRemaining,
  formatClock,
  isWarning,
  nextPhase,
  phaseDurationSeconds,
} from "@/lib/exam-mode";
