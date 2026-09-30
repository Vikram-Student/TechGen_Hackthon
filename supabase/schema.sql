-- Campus Lost & Found — end-product database upgrade
-- Run this in Supabase SQL Editor AFTER the original starter schema.

create extension if not exists pgcrypto;

-- 1) Public image bucket for non-sensitive item photos.
insert into storage.buckets (id,name,public)
values ('lost-found-images','lost-found-images',true)
on conflict (id) do update set public=true;

drop policy if exists "authenticated upload lost found images" on storage.objects;
drop policy if exists "authenticated update own lost found images" on storage.objects;
drop policy if exists "authenticated delete own lost found images" on storage.objects;
drop policy if exists "authenticated read lost found images" on storage.objects;

create policy "authenticated upload lost found images"
on storage.objects for insert to authenticated
with check (bucket_id='lost-found-images' and (storage.foldername(name))[1]=auth.uid()::text);

create policy "authenticated update own lost found images"
on storage.objects for update to authenticated
using (bucket_id='lost-found-images' and (storage.foldername(name))[1]=auth.uid()::text)
with check (bucket_id='lost-found-images' and (storage.foldername(name))[1]=auth.uid()::text);

create policy "authenticated delete own lost found images"
on storage.objects for delete to authenticated
using (bucket_id='lost-found-images' and (storage.foldername(name))[1]=auth.uid()::text);

create policy "authenticated read lost found images"
on storage.objects for select to authenticated
using (bucket_id='lost-found-images');

-- 2) Private messages linked to a claim. Phone numbers/emails should never be stored here.
create table if not exists public.claim_messages (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.claim_messages enable row level security;

create policy "claim participants read messages" on public.claim_messages
for select to authenticated
using (
  sender_id=auth.uid()
  or exists (
    select 1 from public.claims c
    join public.items i on i.id=c.item_id
    where c.id=claim_id and (c.claimant_id=auth.uid() or i.owner_id=auth.uid())
  )
  or public.is_admin()
);

create policy "claim participants send messages" on public.claim_messages
for insert to authenticated
with check (
  sender_id=auth.uid()
  and exists (
    select 1 from public.claims c
    join public.items i on i.id=c.item_id
    where c.id=claim_id and (c.claimant_id=auth.uid() or i.owner_id=auth.uid())
  )
);

-- 3) Require a photo for every new or updated item report.
-- Existing rows are left untouched so this upgrade can be applied safely.
create or replace function public.require_item_photo()
returns trigger language plpgsql
as $$
begin
  if new.image_path is null or btrim(new.image_path) = '' then
    raise exception 'An item photo is required for every report';
  end if;
  return new;
end;
$$;

drop trigger if exists items_require_photo on public.items;
create trigger items_require_photo
before insert or update of image_path on public.items
for each row execute procedure public.require_item_photo();

-- 4) Helpful indexes.
create index if not exists idx_items_status on public.items(status);
create index if not exists idx_items_category on public.items(category);
create index if not exists idx_items_created_at on public.items(created_at desc);
create index if not exists idx_claims_item_id on public.claims(item_id);
create index if not exists idx_claims_status on public.claims(status);
create index if not exists idx_notifications_user_id on public.notifications(user_id,created_at desc);
create index if not exists idx_claim_messages_claim_id on public.claim_messages(claim_id,created_at);

-- 5) Notifications for claim activity.
create or replace function public.notify_claim_created()
returns trigger language plpgsql security definer set search_path=public
as $$
declare v_owner uuid; v_title text;
begin
  select owner_id,title into v_owner,v_title from public.items where id=new.item_id;
  if v_owner is not null and v_owner <> new.claimant_id then
    insert into public.notifications(user_id,title,message)
    values(v_owner,'New private claim', 'Someone submitted a private claim for "'||v_title||'". Review it in the Admin/claim workflow.');
  end if;
  return new;
end;
$$;

drop trigger if exists claim_created_notification on public.claims;
create trigger claim_created_notification after insert on public.claims
for each row execute procedure public.notify_claim_created();

create or replace function public.notify_claim_status_change()
returns trigger language plpgsql security definer set search_path=public
as $$
declare v_title text; v_message text;
begin
  if new.status is distinct from old.status and new.status in ('accepted','rejected','cancelled') then
    select title into v_title from public.items where id=new.item_id;
    v_message := case when new.status='accepted' then 'Your claim for "'||v_title||'" was accepted. Arrange the handover through a safe campus-approved location.'
      when new.status='rejected' then 'Your claim for "'||v_title||'" was not accepted.'
      else 'Your claim for "'||v_title||'" was cancelled.' end;
    insert into public.notifications(user_id,title,message)
    values(new.claimant_id,'Claim updated',v_message);
  end if;
  return new;
end;
$$;

drop trigger if exists claim_status_notification on public.claims;
create trigger claim_status_notification after update of status on public.claims
for each row execute procedure public.notify_claim_status_change();

-- 6) Secure claim decisions. Only the item owner or admin can call these.
create or replace function public.accept_claim(p_claim_id uuid)
returns void language plpgsql security definer set search_path=public
as $$
declare v_item uuid; v_owner uuid; v_claimant uuid;
begin
  select c.item_id,i.owner_id,c.claimant_id into v_item,v_owner,v_claimant
  from public.claims c join public.items i on i.id=c.item_id where c.id=p_claim_id;
  if v_item is null then raise exception 'Claim not found'; end if;
  if auth.uid() is distinct from v_owner and not public.is_admin() then raise exception 'Not authorized'; end if;
  update public.claims set status='rejected' where item_id=v_item and id<>p_claim_id and status='pending';
  update public.claims set status='accepted' where id=p_claim_id;
  update public.items set status='returned' where id=v_item;
end;
$$;

grant execute on function public.accept_claim(uuid) to authenticated;

create or replace function public.reject_claim(p_claim_id uuid)
returns void language plpgsql security definer set search_path=public
as $$
declare v_owner uuid; v_status public.claim_status;
begin
  select i.owner_id,c.status into v_owner,v_status from public.claims c join public.items i on i.id=c.item_id where c.id=p_claim_id;
  if v_owner is null then raise exception 'Claim not found'; end if;
  if auth.uid() is distinct from v_owner and not public.is_admin() then raise exception 'Not authorized'; end if;
  update public.claims set status='rejected' where id=p_claim_id and status='pending';
end;
$$;

grant execute on function public.reject_claim(uuid) to authenticated;

-- 7) Replace public view so frontend can display safe owner-state information without owner identity.
drop view if exists public.items_public;
create view public.items_public with (security_invoker=true) as
select id,title,category,type,status,location,event_date,description,image_path,created_at
from public.items where status <> 'archived';

grant select on public.items_public to authenticated;
