import { createAdminClient, DEMO_TENANT } from "../../../lib/supabase";
import type { JobWithBoat } from "../../../lib/types";
import { JobBoard } from "../../../components/job-board";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `*, boat:boats(name, make, model, customer:customers(name))`
    )
    .eq("tenant_id", DEMO_TENANT)
    .order("due_date", { ascending: true });

  if (error) {
    return (
      <div className="p-8 text-red-600">
        Error loading jobs: {error.message}
      </div>
    );
  }

  const jobs = (data ?? []) as unknown as JobWithBoat[];

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Job Board</h1>
          <p className="text-sm text-slate-500">{jobs.length} active jobs</p>
        </div>
        <button
          className="bg-sky-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
          disabled
          title="Coming soon"
        >
          + New Job
        </button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-auto pt-4">
        <JobBoard jobs={jobs} />
      </div>
    </div>
  );
}
