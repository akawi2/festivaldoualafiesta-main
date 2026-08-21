-- Fix search path issue for the admin_login function
create or replace function public.admin_login(p_email text, p_password text)
returns table (
  id uuid,
  email text,
  name text,
  role text,
  is_active boolean
)
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return query
  select au.id, au.email, au.name, au.role, au.is_active
  from admin_users au
  where au.email = p_email
    and au.is_active = true
    and au.password_hash = crypt(p_password, au.password_hash)
  limit 1;
end;
$$;