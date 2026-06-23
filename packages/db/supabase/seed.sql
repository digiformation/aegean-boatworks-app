-- ============================================================
-- Demo seed — Aegean Boatworks (is_demo = true)
-- Nightly cron truncates and re-runs this for the demo tenant.
-- ============================================================

-- Tenant
insert into tenants (id, name, slug, is_demo, plan) values
  ('00000000-0000-0000-0000-000000000001', 'Aegean Boatworks', 'aegean-boatworks', true, 'pro');

-- Staff users (auth.users rows must be created via Supabase Auth;
-- these profiles reference pre-created demo user UUIDs)

-- Customers
insert into customers (id, tenant_id, name, email, phone) values
  ('c1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Nikos Papadopoulos', 'nikos@example.com', '+30 697 0000001'),
  ('c1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Elena Stavrou', 'elena@example.com', '+30 697 0000002'),
  ('c1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Kostas Dimitriou', 'kostas@example.com', '+30 697 0000003'),
  ('c1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Maria Alexiou', 'maria@example.com', '+30 697 0000004');

-- Boats
insert into boats (id, tenant_id, customer_id, name, make, model, year, length_m, engine, registration) values
  ('b1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Poseidon', 'Beneteau', 'Oceanis 46.1', 2019, 14.35, 'Yanmar 4JH45', 'GR-ATT-1001'),
  ('b1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'Aegean Star', 'Jeanneau', 'Sun Odyssey 440', 2021, 13.35, 'Volvo D1-30', 'GR-ATT-1002'),
  ('b1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', 'Kyma', 'Bavaria', 'C42', 2017, 12.85, 'Yanmar 3YM30', 'GR-ATT-1003'),
  ('b1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004', 'Blue Horizon', 'Elan', 'E4', 2020, 11.90, 'Volvo D1-20', 'GR-ATT-1004');

-- Jobs (mix of statuses to show the board)
-- UUIDs use only valid hex digits (0-9, a-f)
insert into jobs (id, tenant_id, boat_id, job_number, type, status, title, description, estimated_hours, due_date) values
  ('a1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'BW-2026-0041', 'antifouling',    'in_progress',    'Spring antifouling — Poseidon',        'Full hull clean, antifouling paint (2 coats), anode replacement', 16, '2026-04-15'),
  ('a1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'BW-2026-0042', 'engine_service', 'waiting_parts',  'Engine service 500h — Aegean Star',    'Volvo D1-30 500h service: impeller, belts, zincs, oil change',    8,  '2026-04-20'),
  ('a1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'BW-2026-0043', 'annual_survey',  'intake',         'Annual survey — Kyma',                 'Pre-launch safety survey. Owner requests rig inspection.',        6,  '2026-04-22'),
  ('a1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'BW-2026-0040', 'haul_out',       'complete',       'Haul-out & winter prep — Blue Horizon', 'Haul, pressure wash, winterise engine, shrink wrap.',            10, '2025-11-01');

-- Parts inventory
insert into parts (id, tenant_id, sku, name, quantity, reorder_point, bin_location, unit_cost) values
  ('f1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'ANT-BLU-5L',   'Antifouling paint (blue, 5L)',  6,  4, 'A1-R1', 85.00),
  ('f1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'ANT-BLK-5L',   'Antifouling paint (black, 5L)', 2,  4, 'A1-R2', 85.00),
  ('f1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'IMP-YNM-3YM',  'Impeller Yanmar 3YM30',         3,  2, 'B2-R1', 32.50),
  ('f1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'IMP-VOL-D1',   'Impeller Volvo D1',             1,  2, 'B2-R2', 28.00),
  ('f1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'ZNC-SHAFT-M8', 'Shaft zinc anode M8',           12, 6, 'C1-R1', 12.00),
  ('f1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'OIL-15W40-4L', 'Engine oil 15W40 (4L)',          8,  4, 'D1-R1', 22.00);

-- Reminders
insert into reminders (tenant_id, boat_id, type, due_date) values
  ('00000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'annual_survey', '2026-09-01'),
  ('00000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'antifouling',   '2027-03-01'),
  ('00000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'engine_service','2026-10-01');
