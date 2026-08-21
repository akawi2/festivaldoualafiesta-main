-- Create RPC function to get all partners for admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.admin_get_partners()
RETURNS TABLE (
  id uuid,
  name text,
  logo_url text,
  partner_type text,
  website_url text,
  is_active boolean,
  display_order integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.logo_url,
    p.partner_type,
    p.website_url,
    p.is_active,
    p.display_order,
    p.created_at,
    p.updated_at
  FROM public.partners p
  ORDER BY p.display_order ASC;
END;
$$;