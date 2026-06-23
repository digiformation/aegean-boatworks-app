"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, DEMO_TENANT } from "../../../lib/supabase";

const STATUS_FLOW = [
  "intake",
  "in_progress",
  "waiting_parts",
  "ready",
  "complete",
  "invoiced",
] as const;

type Status = (typeof STATUS_FLOW)[number];

export async function advanceJobStatus(jobId: string, currentStatus: string) {
  const idx = STATUS_FLOW.indexOf(currentStatus as Status);
  if (idx === -1 || idx === STATUS_FLOW.length - 1) return;

  const nextStatus = STATUS_FLOW[idx + 1];
  const supabase = createAdminClient();

  await supabase
    .from("jobs")
    .update({ status: nextStatus })
    .eq("id", jobId)
    .eq("tenant_id", DEMO_TENANT);

  revalidatePath("/jobs");
}
