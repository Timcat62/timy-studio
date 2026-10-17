-- Run once in the Supabase SQL editor, after 2026-10-shop-and-disk.sql.

-- Extra preview images of a shop product, shown after the cover (paths on the disk, in order).
alter table products add column if not exists images text[] not null default '{}';

-- How a final price was worked out, shown to the client under the price: [{ "label": "...", "amount": 12000 }].
alter table orders add column if not exists quote_breakdown jsonb;
