-- Create RPC function to delete a partner (bypasses RLS)
CREATE OR REPLACE FUNCTION public.admin_delete_partner(p_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.partners WHERE id = p_id;
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Create RPC function to toggle partner active status (bypasses RLS)
CREATE OR REPLACE FUNCTION public.admin_toggle_partner_active(p_id uuid, p_is_active boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.partners
  SET is_active = p_is_active,
      updated_at = now()
  WHERE id = p_id;
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;