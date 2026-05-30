import Link from "next/link";
import { AcademicBreadcrumb } from "@/app/components/AcademicBreadcrumb";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import {
  QA_TOOLS,
  computeReadiness,
  readinessScore,
} from "@/lib/readiness";
import {
  getDashboardStats,
  getSynopsis,
  getTotalSectionCount,
} from "@/lib/repository";

export const metadata = {
  title: "Project Readiness · DEproject",
  description: "Track exam deliverables and quality-assurance tooling at a glance.",
};
