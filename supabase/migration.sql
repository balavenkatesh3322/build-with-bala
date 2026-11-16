-- ============================================================================
-- Build with Bala · Supabase schema
-- Run once: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run (idempotent).
--
-- SECURITY MODEL
--   • The browser may only READ public content (apps, approved ideas, aggregate counts).
--   • ALL writes (votes, ideas, subscribers, poll, quiz) go through Next.js API routes
--     that use the service-role key (which bypasses RLS). Anonymous visitors can therefore
--     NOT forge voter ids or insert rows directly with the public anon key.
--   • Raw vote / voter / email tables have RLS enabled with NO policies = no public access.
--     Aggregates are exposed through views.
-- ============================================================================

create extension if not exists pgcrypto;

-- ── Catalogue ──────────────────────────────────────────────────────────────
create table if not exists apps (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  name           text not null,
  tagline        text not null,
  hook           text not null,
  problem        text not null,
  solution       text not null,
  value          text not null,
  audience       text not null,
  stack          text not null,
  category       text not null,
  status         text not null check (status in ('live','open-source','coming','lab')),
  live_url       text,
  repo_url       text,
  video          text,
  video_vertical text,
  poster         text,
  accent         text default '#D81B60',
  featured       boolean default false,
  sort_order     int default 100,
  created_at     timestamptz default now()
);

-- ── Votes (private tables; counts exposed via views) ───────────────────────
create table if not exists upvotes (
  id         uuid primary key default gen_random_uuid(),
  app_id     uuid not null references apps(id) on delete cascade,
  voter_id   text not null,
  created_at timestamptz default now(),
  unique (app_id, voter_id)
);

create table if not exists subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  source     text,
  created_at timestamptz default now()
);

create table if not exists ideas (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('idea','pain','feature')),
  title         text not null check (char_length(title) between 3 and 200),
  description   text check (description is null or char_length(description) <= 1500),
  app_slug      text,
  role          text,
  frequency     text,
  would_pay     text check (would_pay in ('yes','maybe','no')),
  contact_email text,                       -- private: never exposed by views
  status        text not null default 'open'
                check (status in ('open','under-review','planned','building','shipped')),
  approved      boolean not null default true,   -- set false to moderate manually
  voter_id      text,
  created_at    timestamptz default now()
);

create table if not exists idea_votes (
  id         uuid primary key default gen_random_uuid(),
  idea_id    uuid not null references ideas(id) on delete cascade,
  voter_id   text not null,
  created_at timestamptz default now(),
  unique (idea_id, voter_id)
);

create table if not exists poll_votes (
  id         uuid primary key default gen_random_uuid(),
  poll_key   text not null,
  option     int  not null check (option >= 0),
  voter_id   text not null,
  created_at timestamptz default now(),
  unique (poll_key, voter_id)
);

create table if not exists quiz_answers (
  id         uuid primary key default gen_random_uuid(),
  quiz_key   text not null,
  option     int  not null check (option >= 0),
  correct    boolean not null,
  voter_id   text not null,
  created_at timestamptz default now(),
  unique (quiz_key, voter_id)
);

create index if not exists idx_upvotes_app     on upvotes(app_id);
create index if not exists idx_ideas_kind      on ideas(kind, status);
create index if not exists idx_idea_votes_idea on idea_votes(idea_id);
create index if not exists idx_poll_key        on poll_votes(poll_key);
create index if not exists idx_quiz_key        on quiz_answers(quiz_key);

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table apps         enable row level security;
alter table upvotes      enable row level security;
alter table subscribers  enable row level security;
alter table ideas        enable row level security;
alter table idea_votes   enable row level security;
alter table poll_votes   enable row level security;
alter table quiz_answers enable row level security;

drop policy if exists "apps are public"  on apps;
create policy "apps are public" on apps for select using (true);
-- ideas: no direct policy; read through idea_stats view (excludes email + voter_id).
-- Everything else: no policies → only the service role (API routes) can touch them.

-- ── Public aggregate views (run with owner rights, so they can read private tables) ─
create or replace view app_stats as
  select a.slug, count(u.id)::int as upvotes
  from apps a left join upvotes u on u.app_id = a.id
  group by a.slug;

create or replace view idea_stats as
  select i.id, i.kind, i.title, i.description, i.app_slug, i.role, i.status, i.created_at,
         count(v.id)::int as votes
  from ideas i left join idea_votes v on v.idea_id = i.id
  where i.approved
  group by i.id;

create or replace view poll_results as
  select poll_key, option, count(*)::int as votes from poll_votes group by poll_key, option;

create or replace view quiz_stats as
  select quiz_key, count(*)::int as total, count(*) filter (where correct)::int as correct
  from quiz_answers group by quiz_key;

grant select on app_stats, idea_stats, poll_results, quiz_stats to anon, authenticated;
