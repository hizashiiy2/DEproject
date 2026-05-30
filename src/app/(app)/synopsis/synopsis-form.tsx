"use client";

import { useActionState, useMemo, useState } from "react";
import { saveSynopsisAction, type ActionState } from "@/app/actions";
import { FieldErrors } from "@/app/components/FieldErrors";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { buildSynopsisMarkdown } from "@/lib/synopsis";
import type { SynopsisInput } from "@/lib/schemas";

const label = "text-xs font-bold uppercase tracking-wider text-on-surface-variant";

const COURSE_TOPICS = [
  "Web frameworks",
  "Quality Assurance",
  "Version Control (VCS)",
  "Deployment",
  "CI/CD",
  "Development environment / IDEs",
] as const;
