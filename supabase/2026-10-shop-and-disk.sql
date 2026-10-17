-- Run once in the Supabase SQL editor (safe to run again).
-- 1. Files stored on the server's own disk, and files sent in the chat.
alter table attachments add column if not exists on_disk boolean not null default false;
alter table attachments add column if not exists complete boolean not null default true;
alter table attachments add column if not exists sender text not null default 'client';
alter table attachments add column if not exists via_chat boolean not null default false;
alter table messages add column if not exists attachment_id uuid references attachments(id) on delete set null;

-- 2. Shop: products, their files, and purchases.
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  description text not null default '',
  price_cents integer not null default 0,        -- 0 = free for signed-in visitors
  currency text not null default 'eur',
  thumb_path text,                                -- on the server's disk
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  filename text not null,
  path text not null,                             -- on the server's disk
  size bigint not null default 0,
  content_type text,
  complete boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists product_files_product_idx on product_files(product_id);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  token uuid not null unique default gen_random_uuid(), -- secret in the buyer's download link
  product_id uuid references products(id) on delete set null,
  email text not null,
  user_id uuid references auth.users(id) on delete set null,
  amount integer not null default 0,
  currency text not null default 'eur',
  stripe_session_id text unique,
  created_at timestamptz not null default now()
);
create index if not exists purchases_user_idx on purchases(user_id);
create index if not exists purchases_email_idx on purchases(lower(email));

alter table products enable row level security;
alter table product_files enable row level security;
alter table purchases enable row level security;
