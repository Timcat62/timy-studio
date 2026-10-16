-- Run once in the Supabase SQL editor to add client accounts to an existing database.
alter table orders add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists orders_user_idx on orders(user_id);
create index if not exists orders_email_idx on orders(lower(email));
