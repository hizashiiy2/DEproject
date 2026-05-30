"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import {
  EXAM_CHECKLIST,
  EXAM_PHASE_LABELS,
  computeRemaining,
  formatClock,
  isWarning,
  nextPhase,
  phaseDurationSeconds,
  type ExamPhase,
} from "@/lib/exam-mode";

const TIMED_PHASES = ["presentation", "dialogue", "evaluation"] as const;
type TimedPhase = (typeof TIMED_PHASES)[number];

const PHASE_ICON: Record<TimedPhase, string> = {
  presentation: "present_to_all",
  dialogue: "psychology",
  evaluation: "reviews",
};
