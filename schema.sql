-- ============================================================
--  KOLAR PUTIH — DONATION SCHEMA (Neon / Postgres)
--  Idempotent: safe to run repeatedly.
-- ============================================================

-- ---------- 1. DONATIONS --------------------------------------
create table if not exists donations (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  donor_name        text,
  donor_email       text,
  donor_phone       text,
  amount_cents      integer not null check (amount_cents > 0),
  currency          text not null default 'MYR',
  campaign          text not null default 'general',
  message           text,
  is_anonymous      boolean not null default false,
  gateway           text not null default 'chip',
  chip_purchase_id  text,
  chip_checkout_url text,
  status            text not null default 'pending'
                    check (status in ('pending','paid','failed','cancelled','refunded')),
  paid_at           timestamptz,
  raw_payload       jsonb,
  source            text not null default 'online'   -- online | manual
);

create index if not exists donations_created_idx on donations (created_at desc);
create index if not exists donations_status_idx  on donations (status);
create index if not exists donations_chip_idx    on donations (chip_purchase_id);

-- ---------- 2. CAMPAIGNS (admin-editable causes) --------------
create table if not exists campaigns (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  blurb       text,
  icon        text default 'volunteer_activism',
  goal_cents  integer,
  active      boolean not null default true,
  sort_order  integer not null default 100,
  created_at  timestamptz not null default now()
);

-- seed sensible defaults once
insert into campaigns (slug, title, blurb, icon, sort_order) values
  ('general',   'Where It Is Needed Most', 'Let us direct your gift to the most urgent need right now.', 'volunteer_activism', 10),
  ('food',      'Food Packs & Sahur Meals', 'Packed meals, dry goods and cooking ingredients for street distribution.', 'restaurant', 20),
  ('clothing',  'Clothing & Basic Needs', 'Warm clothing and everyday essentials for people living rough.', 'checkroom', 30),
  ('orphanage', 'Orphanage Support', 'Supporting orphanages with what they need to raise children well.', 'child_care', 40),
  ('education', 'Education Fund', 'Learning resources so underprivileged children can reach their potential.', 'menu_book', 50)
on conflict (slug) do nothing;

-- ---------- 3. SETTINGS (single row, holds the CHIP key) ------
-- chip_secret_key is AES-256-GCM ciphertext — never plaintext.
create table if not exists site_settings (
  id              integer primary key default 1,
  chip_secret_key text,
  chip_brand_id   text,
  chip_mode       text not null default 'live' check (chip_mode in ('live','sandbox')),
  chip_enabled    boolean not null default false,
  contact_email   text default 'unitednation.kolarputih@gmail.com',
  updated_at      timestamptz not null default now(),
  constraint site_settings_single_row check (id = 1)
);

insert into site_settings (id) values (1) on conflict (id) do nothing;

-- ---------- 4. ADMIN LOGIN (single password hash) -------------
create table if not exists admin_users (
  id            integer primary key default 1,
  password_hash text not null,
  created_at    timestamptz not null default now(),
  constraint admin_users_single_row check (id = 1)
);

-- ---------- 5. HANDY VIEW -------------------------------------
create or replace view donation_summary as
select
  coalesce(sum(amount_cents) filter (where status = 'paid'), 0)::bigint as total_paid_cents,
  count(*) filter (where status = 'paid')::int                         as paid_count,
  count(*) filter (where status = 'pending')::int                      as pending_count,
  coalesce(sum(amount_cents) filter (where status = 'paid'
      and created_at >= date_trunc('month', now())), 0)::bigint        as month_paid_cents,
  count(*) filter (where status = 'paid'
      and created_at >= date_trunc('month', now()))::int               as month_paid_count
from donations;
