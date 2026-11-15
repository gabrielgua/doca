drop policy "People read their own profile and admins read every profile" on public.profiles;
drop policy "Managers read the profiles of people in their companies" on public.profiles;

create policy "People read their own profile, managers their members and admins everyone"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.is_admin())
  or (select private.shares_managed_company_with(id))
);

alter table public.company_members
add constraint company_members_user_id_profiles_fkey
foreign key (user_id) references public.profiles (id) on delete cascade;
