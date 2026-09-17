-- admin_create_user/admin_update_user_password (20260917000000) échouaient
-- avec "function gen_salt(unknown) does not exist" : sur ce projet, pgcrypto
-- vit dans le schéma extensions, absent du search_path restreint à 'public'
-- utilisé par ces fonctions. Plutôt qu'élargir le search_path (surface
-- d'attaque plus grande pour une fonction SECURITY DEFINER), on qualifie
-- explicitement les deux appels avec extensions.*.
CREATE OR REPLACE FUNCTION public.admin_create_user(
  p_email text,
  p_name text,
  p_password text,
  p_role text DEFAULT 'admin',
  p_is_active boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_id uuid;
BEGIN
  IF p_password IS NULL OR length(p_password) < 6 THEN
    RAISE EXCEPTION 'Le mot de passe doit contenir au moins 6 caractères.' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.admin_users (email, name, password_hash, role, is_active)
  VALUES (p_email, p_name, extensions.crypt(p_password, extensions.gen_salt('bf')), COALESCE(p_role, 'admin'), COALESCE(p_is_active, true))
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_update_user_password(p_id uuid, p_new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF p_new_password IS NULL OR length(p_new_password) < 6 THEN
    RAISE EXCEPTION 'Le mot de passe doit contenir au moins 6 caractères.' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.admin_users
  SET password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf'))
  WHERE id = p_id;
END;
$function$;
