"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Clock, CalendarDays, ChevronRight, Loader2 } from "lucide-react";
import { advanceJobStatus } from "../app/(app)/jobs/actions";
import type { JobWithBoat } from "../lib/types";

const TYPE_LABELS: Record<string, string> = {
  haul_out:       "Haul-out",
  launch:         "Launch",
  antifouling:    "Antifouling",
  engine_service: "Engine Service",
  annual_survey:  "Annual Survey",
  repair:         "Repair",
  winter_storage: "Winter Storage",
  other:          "Other",
};

const TYPE_COLORS: Record<string, string> = {
  haul_out:       "bg-slate-100 text-slate-700",
  launch:         "bg-cyan-50 text-cyan-700",
  antifouling:    "bg-blue-50 text-blue-700",
  engine_service: "bg-orange-50 text-orange-700",
  annual_survey:  "bg-purple-50 text-purple-700",
  repair:         "bg-red-50 text-red-700",
  winter_storage: "bg-indigo-50 text-indigo-700",
  other:          "bg-gray-50 text-gray-600",
};

function dueDateStyle(dateStr: string | null): string {
  if (!dateStr) return "text-slate-400";
  const diff = (new Date(dateStr).getTime() - Date.now()) / 86_400_000;
  if (diff < 0) return "text-red-600 font-medium";
  if (diff <= 7) return "text-amber-600 font-medium";
  return "text-slate-500";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

interface Props {
  job: JobWithBoat;
}

export function JobCard({ job }: Props) {
  const [pending, startTransition] = useTransition();
  const isLast = job.status === "invoiced";

  function handleAdvance() {
    startTransition(() => {
      advanceJobStatus(job.id, job.status ?? "");
    });
  }

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md hover:border-sky-200 transition-all"
    >
      {/* Job number + type badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-mono text-slate-400">{job.job_number}</span>
        <span
          className={`text-xs font-medium px-1.5 py-0.5 rounded whitespace-nowrap ${
            TYPE_COLORS[job.type ?? "other"] ?? TYPE_COLORS.other
          }`}
        >
          {TYPE_LABELS[job.type ?? "other"] ?? job.type}
        </span>
      </div>

      {/* Vessel name */}
      <div className="text-sm font-semibold text-slate-800 mb-0.5">
        {job.boat?.name ?? "Unknown vessel"}
      </div>

      {/* Make/model + customer */}
      <div className="text-xs text-slate-500 mb-3 truncate">
        {job.boat?.make} {job.boat?.model}
        {job.boat?.customer?.name && (
          <span className="text-slate-400"> · {job.boat.customer.name}</span>
        )}
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {job.estimated_hours != null && (
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3" />
              {job.estimated_hours}h
            </span>
          )}
          <span className={`flex items-center gap-1 ${dueDateStyle(job.due_date)}`}>
            <CalendarDays className="w-3 h-3" />
            {formatDate(job.due_date)}
          </span>
        </div>

        {!isLast && (
          <button
            onClick={(e) => {
              e.preventDefault();
              handleAdvance();
            }}
            disabled={pending}
            className="flex items-center gap-0.5 text-slate-400 hover:text-sky-600 transition-colors disabled:opacity-50"
            title="Move to next status"
          >
            {pending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </Link>
  );
}
