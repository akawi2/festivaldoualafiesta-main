-- Après le fix précédent (20260917010000), un compte test créé via
-- admin_create_user (extensions.crypt/gen_salt) ne pouvait PAS se connecter
-- via admin_login : celui-ci utilise un crypt(text, text) non qualifié qui
-- résout apparemment vers une fonction différente (wrapper public.crypt ?)
-- de extensions.crypt — même algorithme bcrypt en théorie, mais on élimine
-- l'ambiguïté en qualifiant explicitement les deux côtés (hash et
-- vérification) avec le même extensions.crypt.
CREATE OR REPLACE FUNCTION public.admin_login(p_email text, p_password text)
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  role text,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email, au.name, au.role, au.is_active
  FROM public.admin_users au
  WHERE au.email = p_email
    AND au.is_active = true
    AND au.password_hash = extensions.crypt(p_password, au.password_hash)
  LIMIT 1;
END;
$function$;
