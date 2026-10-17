-- timy.studio: run this once in the Supabase SQL editor.
-- All access goes through the Next.js server with the service-role key,
-- so row level security is enabled with NO public policies (nothing is readable from the browser).

create extension if not exists pgcrypto;

do $$ begin
  create type order_status as enum ('new', 'discussing', 'quoted', 'paid', 'in_production', 'delivered', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  token uuid not null unique default gen_random_uuid(),   -- secret in the client's private link
  created_at timestamptz not null default now(),

  name text not null,
  email text not null,
  project_type text not null,
  budget text not null,
  description text not null,
  deadline text,
  links text,

  status order_status not null default 'new',

  quote_amount integer,                    -- in cents
  quote_currency text not null default 'eur',
  quote_note text,
  quoted_at timestamptz,

  paid_at timestamptz,
  stripe_session_id text,
  stripe_payment_intent text,

  last_client_message_at timestamptz,
  admin_seen_at timestamptz,
  client_notified_at timestamptz
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  sender text not null check (sender in ('client', 'admin', 'system')),
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists messages_order_idx on messages(order_id, created_at);

create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  path text not null,
  filename text not null,
  size bigint not null default 0,
  content_type text,
  created_at timestamptz not null default now()
);
create index if not exists attachments_order_idx on attachments(order_id);

alter table orders enable row level security;
alter table messages enable row level security;
alter table attachments enable row level security;

-- Private bucket for client files (no public access).
insert into storage.buckets (id, name, public)
values ('briefs', 'briefs', false)
on conflict (id) do nothing;

-- Client accounts (Supabase Auth): a project can belong to an account.
-- Safe to run again on an existing database.
alter table orders add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists orders_user_idx on orders(user_id);
create index if not exists orders_email_idx on orders(lower(email));

-- Public bucket for profile photos (the site also creates it on the first upload).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/webp'])
on conflict (id) do nothing;

-- Shop and files on the server's disk: see 2026-10-shop-and-disk.sql (run it once).
-- Gallery images and price breakdown: see 2026-10-gallery-and-estimate.sql
