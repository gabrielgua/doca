create type public.company_role as enum ('manager', 'client');

alter table public.profiles add column email text;

update public.profiles
set email = users.email
from auth.users as users
where users.id = public.profiles.id;

create or replace function private.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  return new;
end;
$$;

create function private.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

revoke execute on function private.sync_profile_email() from public, anon, authenticated;

create trigger sync_profile_email_after_user_email_changes
after update of email on auth.users
for each row execute function private.sync_profile_email();

create function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 80),
  cnpj text check (cnpj is null or cnpj ~ '^[0-9]{14}$'),
  color text not null default 'sky'
    check (color in ('sky', 'emerald', 'violet', 'amber', 'rose', 'indigo', 'teal', 'orange')),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.company_members (
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.company_role not null,
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create index company_members_user_id_index on public.company_members (user_id);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80),
  created_at timestamptz not null default now(),
  unique (id, company_id)
);

create unique index brands_company_name_unique on public.brands (company_id, lower(name));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  brand_id uuid not null,
  name text not null check (length(trim(name)) between 1 and 160),
  sku text check (sku is null or length(trim(sku)) between 1 and 80),
  asin text check (asin is null or asin ~ '^[A-Z0-9]{10}$'),
  fnsku text check (fnsku is null or fnsku ~ '^[A-Z0-9]{10}$'),
  fnsku_label_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (brand_id, company_id) references public.brands (id, company_id) on delete restrict
);

create unique index products_company_fnsku_unique
on public.products (company_id, fnsku)
where fnsku is not null;

create index products_brand_id_company_id_index on public.products (brand_id, company_id);

create trigger touch_products_updated_at
before update on public.products
for each row execute function private.touch_updated_at();

alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;

revoke all on public.companies, public.company_members, public.brands, public.products from anon;

create function private.can_read_company(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_admin() or exists (
    select 1
    from public.company_members
    where company_id = target_company_id
      and user_id = (select auth.uid())
  );
$$;

create function private.can_edit_company(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_admin() or exists (
    select 1
    from public.company_members
    where company_id = target_company_id
      and user_id = (select auth.uid())
      and role = 'manager'
  );
$$;

create function private.shares_managed_company_with(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.company_members as own_membership
    join public.company_members as other_membership
      on other_membership.company_id = own_membership.company_id
    where own_membership.user_id = (select auth.uid())
      and own_membership.role = 'manager'
      and other_membership.user_id = target_user_id
  );
$$;

create function private.company_id_from_storage_path(object_name text)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select case
    when (storage.foldername(object_name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then ((storage.foldername(object_name))[1])::uuid
  end;
$$;

revoke execute on function private.can_read_company(uuid) from public, anon;
revoke execute on function private.can_edit_company(uuid) from public, anon;
revoke execute on function private.shares_managed_company_with(uuid) from public, anon;
revoke execute on function private.company_id_from_storage_path(text) from public, anon;
grant execute on function private.can_read_company(uuid) to authenticated;
grant execute on function private.can_edit_company(uuid) to authenticated;
grant execute on function private.shares_managed_company_with(uuid) to authenticated;
grant execute on function private.company_id_from_storage_path(text) to authenticated;

create policy "Managers read the profiles of people in their companies"
on public.profiles
for select
to authenticated
using ((select private.shares_managed_company_with(id)));

create policy "People read the companies they belong to"
on public.companies
for select
to authenticated
using ((select private.can_read_company(id)));

create policy "Admins create companies"
on public.companies
for insert
to authenticated
with check ((select private.is_admin()));

create policy "Admins edit companies"
on public.companies
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins delete companies"
on public.companies
for delete
to authenticated
using ((select private.is_admin()));

create policy "People read the members of their companies"
on public.company_members
for select
to authenticated
using ((select private.can_read_company(company_id)));

create policy "Admins and managers link people to their companies"
on public.company_members
for insert
to authenticated
with check ((select private.can_edit_company(company_id)));

create policy "Admins change member roles"
on public.company_members
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins unlink people from companies"
on public.company_members
for delete
to authenticated
using ((select private.is_admin()));

create policy "People read the brands of their companies"
on public.brands
for select
to authenticated
using ((select private.can_read_company(company_id)));

create policy "Admins and managers create brands"
on public.brands
for insert
to authenticated
with check ((select private.can_edit_company(company_id)));

create policy "Admins and managers edit brands"
on public.brands
for update
to authenticated
using ((select private.can_edit_company(company_id)))
with check ((select private.can_edit_company(company_id)));

create policy "Admins delete brands"
on public.brands
for delete
to authenticated
using ((select private.is_admin()));

create policy "People read the products of their companies"
on public.products
for select
to authenticated
using ((select private.can_read_company(company_id)));

create policy "Admins and managers create products"
on public.products
for insert
to authenticated
with check ((select private.can_edit_company(company_id)));

create policy "Admins and managers edit products"
on public.products
for update
to authenticated
using ((select private.can_edit_company(company_id)))
with check ((select private.can_edit_company(company_id)));

create policy "Admins delete products"
on public.products
for delete
to authenticated
using ((select private.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/png',
    'image/jpeg'
  ]
);

create policy "People read the documents of their companies"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'documents'
  and (select private.can_read_company(private.company_id_from_storage_path(name)))
);

create policy "Admins and managers upload documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'documents'
  and (select private.can_edit_company(private.company_id_from_storage_path(name)))
);

create policy "Admins and managers replace documents"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'documents'
  and (select private.can_edit_company(private.company_id_from_storage_path(name)))
)
with check (
  bucket_id = 'documents'
  and (select private.can_edit_company(private.company_id_from_storage_path(name)))
);

create policy "Admins delete documents"
on storage.objects
for delete
to authenticated
using (bucket_id = 'documents' and (select private.is_admin()));
