-- ============================================================
--  KOLAR PUTIH — CAMPAIGNS v2
--  Each campaign becomes its own page with a story, dates and a
--  progress bar. Idempotent: safe to re-run.
-- ============================================================

-- ---------- helper: slugify ----------
create or replace function kp_slugify(txt text)
returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(lower(coalesce(txt,'')), '[^a-z0-9]+', '-', 'g'))
$$;

-- ---------- extend campaigns ----------
alter table campaigns add column if not exists story        text;
alter table campaigns add column if not exists image_url    text;
alter table campaigns add column if not exists starts_at    date;
alter table campaigns add column if not exists ends_at      date;
alter table campaigns add column if not exists show_progress boolean not null default true;
alter table campaigns add column if not exists is_featured  boolean not null default false;
alter table campaigns add column if not exists updated_at   timestamptz not null default now();

-- ---------- donations: tie to a campaign page + note the currency snapshot ----------
alter table donations add column if not exists campaign_slug text;

create index if not exists campaigns_active_idx on campaigns (active, sort_order);

-- ---------- progress view: raised per campaign ----------
create or replace view campaign_progress as
select
  c.id,
  c.slug,
  c.title,
  c.goal_cents,
  coalesce(sum(d.amount_cents) filter (where d.status = 'paid'), 0)::bigint as raised_cents,
  count(d.id) filter (where d.status = 'paid')::int                         as donor_count,
  case when c.goal_cents is null or c.goal_cents = 0 then null
       else least(100, round(
             100.0 * coalesce(sum(d.amount_cents) filter (where d.status = 'paid'), 0)
             / c.goal_cents))::int
  end as percent
from campaigns c
left join donations d on d.campaign = c.slug
group by c.id, c.slug, c.title, c.goal_cents;

-- ---------- a campaign is "open" when active AND inside its window ----------
create or replace view campaigns_public as
select
  c.slug, c.title, c.blurb, c.story, c.icon, c.image_url,
  c.goal_cents, c.starts_at, c.ends_at, c.show_progress, c.is_featured,
  c.active,
  p.raised_cents, p.donor_count, p.percent,
  ( c.active
    and (c.starts_at is null or c.starts_at <= current_date)
    and (c.ends_at   is null or c.ends_at   >= current_date)
  ) as is_open
from campaigns c
join campaign_progress p on p.id = c.id;

-- ---------- clear the old placeholder rows ----------
-- Apeh asked to start from a clean slate; existing donations keep their
-- own campaign_slug so history is never lost.
update donations set campaign_slug = campaign where campaign_slug is null;
delete from campaigns where slug <> 'general';
delete from campaigns where slug = 'general';
