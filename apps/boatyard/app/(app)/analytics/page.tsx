import { createAdminClient, DEMO_TENANT } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

const STATUS_ORDER = ["intake", "in_progress", "waiting_parts", "ready", "complete", "invoiced"] as const;
const STATUS_LABEL: Record<string, string> = {
  intake: "Intake",
  in_progress: "In Progress",
  waiting_parts: "Waiting Parts",
  ready: "Ready",
  complete: "Complete",
  invoiced: "Invoiced",
};
const STATUS_COLOR: Record<string, string> = {
  intake: "bg-slate-400",
  in_progress: "bg-blue-500",
  waiting_parts: "bg-amber-400",
  ready: "bg-emerald-500",
  complete: "bg-green-400",
  invoiced: "bg-purple-400",
};

function KPI({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-3xl font-bold tabular-nums ${accent ?? "text-slate-900"}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

export default async function AnalyticsPage() {
  const supabase = createAdminClient();

  const [{ data: jobs }, { data: parts }] = await Promise.all([
    supabase
      .from("jobs")
      .select("status, type, estimated_hours, due_date")
      .eq("tenant_id", DEMO_TENANT),
    supabase
      .from("parts")
      .select("quantity, reorder_point, unit_cost")
      .eq("tenant_id", DEMO_TENANT),
  ]);

  const allJobs = jobs ?? [];
  const allParts = parts ?? [];

  const today = new Date().toISOString().slice(0, 10);
  const activeJobs = allJobs.filter((j) => j.status !== "invoiced");
  const overdueJobs = activeJobs.filter(
    (j) => j.due_date && j.due_date < today && j.status !== "complete"
  );
  const totalHours = allJobs.reduce((s, j) => s + (j.estimated_hours ?? 0), 0);
  const stockValue = allParts.reduce(
    (s, p) => s + (p.quantity ?? 0) * Number(p.unit_cost ?? 0),
    0
  );
  const belowReorder = allParts.filter(
    (p) => (p.quantity ?? 0) <= (p.reorder_point ?? 0)
  ).length;

  // Jobs by status counts
  const bySatus = STATUS_ORDER.map((key) => ({
    key,
    count: allJobs.filter((j) => j.status === key).length,
  }));
  const maxCount = Math.max(...bySatus.map((s) => s.count), 1);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-lg font-semibold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500">Workshop overview</p>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4">
          <KPI label="Active Jobs" value={activeJobs.length} sub="currently in workshop" />
          <KPI
            label="Overdue"
            value={overdueJobs.length}
            sub="past due date"
            accent={overdueJobs.length > 0 ? "text-red-600" : undefined}
          />
          <KPI
            label="Parts Below Reorder"
            value={belowReorder}
            sub="need restocking"
            accent={belowReorder > 0 ? "text-amber-600" : undefined}
          />
          <KPI
            label="Stock Value"
            value={`€${stockValue.toFixed(0)}`}
            sub="parts on hand"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Jobs by status */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Jobs by Status</h2>
            <div className="space-y-3">
              {bySatus.map(({ key, count }) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-slate-600 text-right shrink-0">
                    {STATUS_LABEL[key]}
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${STATUS_COLOR[key]}`}
                      style={{ width: count === 0 ? "0%" : `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <div className="w-5 text-xs font-semibold text-slate-700 tabular-nums">{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hours summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Workshop Load</h2>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Total estimated hours across all jobs</div>
                <div className="text-4xl font-bold text-slate-900 tabular-nums">{totalHours}h</div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="text-xs text-slate-500 mb-2">Breakdown by job type</div>
                {(["antifouling", "engine_service", "annual_survey", "haul_out"] as const).map((type) => {
                  const hrs = allJobs
                    .filter((j) => j.type === type)
                    .reduce((s, j) => s + (j.estimated_hours ?? 0), 0);
                  if (hrs === 0) return null;
                  const TYPE_LABEL: Record<string, string> = {
                    antifouling: "Antifouling",
                    engine_service: "Engine Service",
                    annual_survey: "Annual Survey",
                    haul_out: "Haul-out",
                  };
                  return (
                    <div key={type} className="flex justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-slate-600">{TYPE_LABEL[type]}</span>
                      <span className="font-semibold text-slate-800 tabular-nums">{hrs}h</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
