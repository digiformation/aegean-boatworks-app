// Auto-generated from Supabase schema via: pnpm supabase gen types typescript
// Run `pnpm db:types` to regenerate after schema changes.
//
// Until you have a live Supabase project, these are hand-maintained.
// Once the project is live: supabase gen types typescript --project-id <id> > src/types.ts

export type Role = "admin" | "staff" | "technician" | "customer";
export type Plan = "trial" | "starter" | "pro";

export type JobType =
  | "haul_out"
  | "launch"
  | "antifouling"
  | "engine_service"
  | "annual_survey"
  | "repair"
  | "winter_storage"
  | "other";

export type JobStatus =
  | "intake"
  | "in_progress"
  | "waiting_parts"
  | "ready"
  | "complete"
  | "invoiced";

export type ItemStatus = "pending" | "in_progress" | "done";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  is_demo: boolean;
  plan: Plan;
  created_at: string;
}

export interface Profile {
  id: string;
  tenant_id: string;
  role: Role;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  tenant_id: string;
  profile_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface Boat {
  id: string;
  tenant_id: string;
  customer_id: string;
  name: string;
  make: string | null;
  model: string | null;
  year: number | null;
  length_m: number | null;
  beam_m: number | null;
  draft_m: number | null;
  engine: string | null;
  registration: string | null;
  hull_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  tenant_id: string;
  boat_id: string;
  job_number: string | null;
  type: JobType;
  status: JobStatus;
  title: string;
  description: string | null;
  estimated_hours: number | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface JobItem {
  id: string;
  tenant_id: string;
  job_id: string;
  description: string;
  status: ItemStatus;
  assigned_to: string | null;
  sort_order: number;
  created_at: string;
}

export interface Part {
  id: string;
  tenant_id: string;
  sku: string | null;
  name: string;
  description: string | null;
  quantity: number;
  reorder_point: number;
  bin_location: string | null;
  unit_cost: number | null;
  supplier: string | null;
  created_at: string;
}

export interface JobPart {
  id: string;
  tenant_id: string;
  job_id: string;
  part_id: string;
  quantity: number;
  unit_cost: number | null;
  created_at: string;
}

export interface TimeEntry {
  id: string;
  tenant_id: string;
  job_id: string;
  technician_id: string;
  hours: number;
  notes: string | null;
  logged_at: string;
}

export interface Reminder {
  id: string;
  tenant_id: string;
  boat_id: string;
  type: string;
  due_date: string;
  notes: string | null;
  sent_at: string | null;
  acknowledged_at: string | null;
  created_at: string;
}
