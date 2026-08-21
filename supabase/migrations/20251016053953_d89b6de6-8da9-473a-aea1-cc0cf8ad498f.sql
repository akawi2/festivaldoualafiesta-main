-- Create SECURITY DEFINER function to upsert partners bypassing RLS for admin UI
create or replace function public.admin_upsert_partner(
  p_name text,
  p_partner_type text,
  p_id uuid default null,
  p_logo_url text default null,
  p_website_url text default null,
  p_is_active boolean default true,
  p_display_order integer default 0
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if p_id is null then
    insert into public.partners (
      name,
      partner_type,
      logo_url,
      website_url,
      is_active,
      display_order
    ) values (
      p_name,
      p_partner_type,
      p_logo_url,
      p_website_url,
      coalesce(p_is_active, true),
      coalesce(p_display_order, 0)
    ) returning id into new_id;
  else
    update public.partners
    set
      name = p_name,
      partner_type = p_partner_type,
      logo_url = p_logo_url,
      website_url = p_website_url,
      is_active = coalesce(p_is_active, is_active),
      display_order = coalesce(p_display_order, display_order),
      updated_at = now()
    where id = p_id
    returning id into new_id;
  end if;

  return new_id;
end;
$$;