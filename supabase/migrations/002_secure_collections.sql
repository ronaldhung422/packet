-- Run independently of the legacy 001 scripts. Existing tables/data are retained.
begin;
create table if not exists public.packet_collections (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null default replace(gen_random_uuid()::text, '-', ''),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create table if not exists public.packet_members (
  user_id uuid primary key references auth.users(id),
  collection_id uuid not null references public.packet_collections(id)
);
create table if not exists public.packet_records (
  collection_id uuid not null references public.packet_collections(id),
  id text not null,
  data jsonb,
  deleted boolean not null default false,
  primary key (collection_id, id)
);
alter table public.packet_collections enable row level security;
alter table public.packet_members enable row level security;
alter table public.packet_records enable row level security;
revoke all on public.packet_collections, public.packet_members, public.packet_records from anon, authenticated;
alter table public.pairs enable row level security;
alter table public.places enable row level security;
alter table public.sync_status enable row level security;
revoke all on public.pairs, public.places, public.sync_status from anon, authenticated;
drop policy if exists "Pairs are readable by anyone with pair code" on public.pairs;
drop policy if exists "Places are readable by anyone with pair code" on public.places;
drop policy if exists "Places can be inserted with valid pair code" on public.places;
drop policy if exists "Places can be updated by pair code" on public.places;
drop policy if exists "Places can be deleted (soft) by pair code" on public.places;
drop policy if exists "Sync status is readable by pair code" on public.sync_status;

create or replace function public.ensure_pair(p_pair_code text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_pair_code !~ '^PACKET-[A-Z0-9]{6}$' then raise exception 'Invalid pair code'; end if;
  insert into public.pairs(pair_code, is_active, last_sync) values(p_pair_code, true, now())
  on conflict(pair_code) do update set is_active = true, last_sync = now();
end;
$$;
revoke all on function public.ensure_pair(text) from public, anon;
grant execute on function public.ensure_pair(text) to authenticated;

grant select on public.packet_collections, public.packet_members, public.packet_records to authenticated;
drop policy if exists own_membership on public.packet_members;
create policy own_membership on public.packet_members for select to authenticated using (user_id = auth.uid());
drop policy if exists member_collection on public.packet_collections;
create policy member_collection on public.packet_collections for select to authenticated
using (id in (select collection_id from public.packet_members where user_id = auth.uid()));
drop policy if exists member_records on public.packet_records;
create policy member_records on public.packet_records for select to authenticated
using (collection_id in (select collection_id from public.packet_members where user_id = auth.uid()));

create or replace function public.packet_connect(p_code text default null)
returns table(collection_id uuid, invite_code text)
language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_code text; v_existing uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_code is not null and p_code !~ '^[a-f0-9]{32}$' then raise exception 'Invalid invitation'; end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
  select m.collection_id into v_existing from packet_members m where m.user_id = auth.uid();
  if v_existing is not null then
    select c.id, c.invite_code into v_id, v_code from packet_collections c where c.id = v_existing;
    if p_code is not null and lower(p_code) <> v_code then
      raise exception 'Device already belongs to another collection';
    end if;
  elsif p_code is null then
    insert into packet_collections(created_by) values(auth.uid()) returning id, packet_collections.invite_code into v_id, v_code;
  else
    select c.id, c.invite_code into v_id, v_code from packet_collections c where c.invite_code = lower(p_code);
    if v_id is null then raise exception 'Invalid invitation'; end if;
  end if;
  insert into packet_members(user_id, collection_id) values(auth.uid(), v_id) on conflict(user_id) do nothing;
  return query select v_id, v_code;
end;
$$;

-- Mutation IDs are supplied by the client; repeated uploads are idempotent.
create table if not exists public.packet_operations (
  collection_id uuid not null references public.packet_collections(id),
  operation_id uuid not null,
  primary key(collection_id, operation_id)
);
alter table public.packet_operations enable row level security;
revoke all on public.packet_operations from anon, authenticated;
create or replace function public.packet_apply(p_collection uuid, p_changes jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare item jsonb;
begin
  if auth.uid() is null or not exists(select 1 from packet_members where user_id = auth.uid() and collection_id = p_collection) then
    raise exception 'Access denied';
  end if;
  if p_changes is null or jsonb_typeof(p_changes) <> 'array' or jsonb_array_length(p_changes) > 100 then raise exception 'Invalid batch'; end if;
  for item in select value from jsonb_array_elements(p_changes) loop
    if item->>'type' not in ('create','update','delete') or coalesce(item->'place'->>'id','') = '' then raise exception 'Invalid change'; end if;
    perform pg_advisory_xact_lock(hashtext(p_collection::text), hashtext(item->'place'->>'id'));
    insert into packet_operations values(p_collection, (item->>'operationId')::uuid) on conflict do nothing;
    if not found then continue; end if;
    if item->>'type' = 'create' then
      insert into packet_records values(p_collection, item->'place'->>'id', item->'place', false) on conflict do nothing;
    elsif item->>'type' = 'delete' then
      insert into packet_records values(p_collection, item->'place'->>'id', null, true)
      on conflict(collection_id,id) do update set deleted = true, data = null;
    else
      insert into packet_records values(p_collection, item->'place'->>'id', item->'place', false)
      on conflict(collection_id,id) do update set data = excluded.data where not packet_records.deleted;
    end if;
  end loop;
end;
$$;
revoke all on function public.packet_connect(text), public.packet_apply(uuid,jsonb) from public, anon;
grant execute on function public.packet_connect(text), public.packet_apply(uuid,jsonb) to authenticated;
commit;
