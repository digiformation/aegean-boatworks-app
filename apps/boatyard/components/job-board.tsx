import { JobCard } from "./job-card";
import type { JobWithBoat } from "../lib/types";

const COLUMNS = [
  {
    key: "intake",
    label: "Intake",
    border: "border-slate-300",
    bg: "bg-slate-50",
    headerBg: "bg-slate-50",
    countBg: "bg-slate-200 text-slate-700",
  },
  {
    key: "in_progress",
    label: "In Progress",
    border: "border-blue-500",
    bg: "bg-blue-50/40",
    headerBg: "bg-blue-50",
    countBg: "bg-blue-100 text-blue-700",
  },
  {
    key: "waiting_parts",
    label: "Waiting Parts",
    border: "border-amber-400",
    bg: "bg-amber-50/40",
    headerBg: "bg-amber-50",
    countBg: "bg-amber-100 text-amber-700",
  },
  {
    key: "ready",
    label: "Ready",
    border: "border-emerald-500",
    bg: "bg-emerald-50/40",
    headerBg: "bg-emerald-50",
    countBg: "bg-emerald-100 text-emerald-700",
  },
  {
    key: "complete",
    label: "Complete",
    border: "border-green-400",
    bg: "bg-white",
    headerBg: "bg-gray-50",
    countBg: "bg-green-50 text-green-700",
  },
  {
    key: "invoiced",
    label: "Invoiced",
    border: "border-purple-400",
    bg: "bg-white",
    headerBg: "bg-gray-50",
    countBg: "bg-purple-50 text-purple-700",
  },
] as const;

interface Props {
  jobs: JobWithBoat[];
}

export function JobBoard({ jobs }: Props) {
  return (
    <div className="flex gap-3 px-6 pb-6 min-h-full">
      {COLUMNS.map((col) => {
        const colJobs = jobs.filter((j) => j.status === col.key);
        return (
          <div key={col.key} className="flex flex-col w-72 shrink-0">
            {/* Column header */}
            <div
              className={`flex items-center justify-between px-3 py-2.5 rounded-t-lg border-t-2 ${col.border} ${col.headerBg}`}
            >
              <span className="text-sm font-semibold text-slate-700">
                {col.label}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.countBg}`}
              >
                {colJobs.length}
              </span>
            </div>

            {/* Job cards */}
            <div
              className={`flex-1 flex flex-col gap-2 p-2 rounded-b-lg ${col.bg} min-h-40`}
            >
              {colJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
              {colJobs.length === 0 && (
                <div className="flex-1 flex items-center justify-center py-8 text-slate-400 text-xs">
                  No jobs
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
