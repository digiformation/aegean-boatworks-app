import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient, DEMO_TENANT } from "../../../../lib/supabase";
import { ChevronLeft, Clock, CalendarDays, Anchor, User, Phone, Mail } from "lucide-react";
import { advanceJobStatus } from "../actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  intake: "Intake",
  in_progress: "In Progress",
  waiting_parts: "Waiting Parts",
  ready: "Ready",
  complete: "Complete",
  invoiced: "Invoiced",
};
const STATUS_COLOR: Record<string, string> = {
  intake: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  waiting_parts: "bg-amber-100 text-amber-700",
  ready: "bg-emerald-100 text-emerald-700",
  complete: "bg-green-50 text-green-700",
  invoiced: "bg-purple-50 text-purple-700",
};
const TYPE_LABEL: Record<string, string> = {
  haul_out: "Haul-out",
  launch: "Launch",
  antifouling: "Antifouling",
  engine_service: "Engine Service",
  annual_survey: "Annual Survey",
  repair: "Repair",
  winter_storage: "Winter Storage",
  other: "Other",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-4 pb-3 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 text-right">{value ?? "—"}</span>
    </div>
  );
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: job } = await supabase
    .from("jobs")
    .select(
      `*, boat:boats(name, make, model, year, engine, registration, customer:customers(name, email, phone)),
       job_parts:job_parts(id, quantity, unit_cost, part:parts(sku, name))`
    )
    .eq("id", id)
    .eq("tenant_id", DEMO_TENANT)
    .single();

  if (!job) notFound();

  const boat = job.boat as any;
  const customer = boat?.customer;
  const jobParts = (job.job_parts ?? []) as any[];
  const partsTotal = jobParts.reduce(
    (s: number, jp: any) => s + jp.quantity * Number(jp.unit_cost ?? 0),
    0
  );

  const status = job.status ?? "intake";
  const isLast = status === "invoiced";
  const statusFlow = ["intake","in_progress","waiting_parts","ready","complete","invoiced"] as const;
  const nextStatus = statusFlow[statusFlow.indexOf(status as typeof statusFlow[number]) + 1];
  const nextStatusLabel = nextStatus ? STATUS_LABEL[nextStatus] : "Next";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/jobs"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-slate-400">{job.job_number}</span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[status] ?? STATUS_COLOR.intake}`}
              >
                {STATUS_LABEL[status] ?? status}
              </span>
            </div>
            <h1 className="text-lg font-semibold text-slate-900">{job.title}</h1>
          </div>
        </div>

        {!isLast && (
          <form action={advanceJobStatus.bind(null, job.id, status)}>
            <button
              type="submit"
              className="bg-sky-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
            >
              Move to {nextStatusLabel}
            </button>
          </form>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Job details */}
          <Section title="Job Details">
            <Field label="Type" value={TYPE_LABEL[job.type ?? "other"] ?? job.type} />
            <Field label="Description" value={job.description} />
            <Field
              label="Estimated Hours"
              value={
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {job.estimated_hours ?? "—"}h
                </span>
              }
            />
            <Field
              label="Due Date"
              value={
                job.due_date ? (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(job.due_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <Field label="Created" value={new Date(job.created_at).toLocaleDateString("en-GB")} />
          </Section>

          {/* Vessel */}
          {boat && (
            <Section title="Vessel">
              <Field
                label="Name"
                value={
                  <span className="flex items-center gap-1">
                    <Anchor className="w-3.5 h-3.5 text-slate-400" />
                    {boat.name}
                  </span>
                }
              />
              <Field label="Make / Model" value={`${boat.make ?? ""} ${boat.model ?? ""}`.trim() || "—"} />
              <Field label="Year" value={boat.year} />
              <Field label="Engine" value={boat.engine} />
              <Field label="Registration" value={boat.registration} />
            </Section>
          )}

          {/* Customer */}
          {customer && (
            <Section title="Owner">
              <Field
                label="Name"
                value={
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {customer.name}
                  </span>
                }
              />
              <Field
                label="Email"
                value={
                  customer.email ? (
                    <a href={`mailto:${customer.email}`} className="flex items-center gap-1 text-sky-600 hover:underline">
                      <Mail className="w-3.5 h-3.5" />
                      {customer.email}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              <Field
                label="Phone"
                value={
                  customer.phone ? (
                    <a href={`tel:${customer.phone}`} className="flex items-center gap-1 text-sky-600 hover:underline">
                      <Phone className="w-3.5 h-3.5" />
                      {customer.phone}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
            </Section>
          )}

          {/* Parts */}
          <Section title={`Parts Used${jobParts.length > 0 ? ` · €${partsTotal.toFixed(2)}` : ""}`}>
            {jobParts.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No parts assigned yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500">
                    <th className="text-left pb-2 font-semibold">Part</th>
                    <th className="text-right pb-2 font-semibold">Qty</th>
                    <th className="text-right pb-2 font-semibold">Unit</th>
                    <th className="text-right pb-2 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobParts.map((jp: any) => (
                    <tr key={jp.id}>
                      <td className="py-2">
                        <div className="font-medium text-slate-800">{jp.part?.name ?? "—"}</div>
                        <div className="text-xs text-slate-400 font-mono">{jp.part?.sku}</div>
                      </td>
                      <td className="py-2 text-right text-slate-600 tabular-nums">{jp.quantity}</td>
                      <td className="py-2 text-right text-slate-600 tabular-nums">€{Number(jp.unit_cost ?? 0).toFixed(2)}</td>
                      <td className="py-2 text-right font-semibold text-slate-800 tabular-nums">
                        €{(jp.quantity * Number(jp.unit_cost ?? 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <td colSpan={3} className="pt-3 text-sm font-semibold text-slate-600">Parts total</td>
                    <td className="pt-3 text-right font-bold text-slate-900 tabular-nums">€{partsTotal.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
