-- Function to update talent status with SECURITY DEFINER to bypass RLS safely
create or replace function public.admin_update_talent_status(p_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('pending','approved','rejected') then
    raise exception 'Invalid status %', p_status using errcode = '22000';
  end if;

  update public.talent_submissions
  set status = p_status,
      updated_at = now()
  where id = p_id;
end;
$$;

comment on function public.admin_update_talent_status(uuid, text) is 'Admin-only RPC to update talent_submissions.status (approved/rejected/pending).';