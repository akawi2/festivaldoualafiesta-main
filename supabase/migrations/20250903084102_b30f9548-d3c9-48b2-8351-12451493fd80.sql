-- Temporary fix: Update admin user with plain text password for testing
-- In production, this should be properly hashed
UPDATE admin_users 
SET password_hash = 'AdminFiest@'
WHERE email = 'jamessoppo@yahoo.fr';

-- Create a simple admin login function without bcrypt for now
DROP FUNCTION IF EXISTS public.admin_login(text, text);

CREATE OR REPLACE FUNCTION public.admin_login(p_email text, p_password text)
RETURNS table (
  id uuid,
  email text,
  name text,
  role text,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email, au.name, au.role, au.is_active
  FROM admin_users au
  WHERE au.email = p_email
    AND au.is_active = true
    AND au.password_hash = p_password
  LIMIT 1;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.admin_login(text, text) TO anon, authenticated;