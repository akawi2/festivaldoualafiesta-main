-- AdminUsersManager (onglet "Utilisateurs") était non fonctionnel de bout en
-- bout : il fait du CRUD direct sur admin_users depuis le client anon, mais
-- cette table n'a que des policies RLS scopées à auth.role() = 'authenticated'
-- (Supabase Auth) — or cette app n'utilise jamais Supabase Auth, tout son
-- auth admin passe par admin_login (SECURITY DEFINER, appelé en anon). Donc
-- pour le client anon, auth.role() vaut toujours 'anon' : SELECT/UPDATE sont
-- silencieusement bloqués par RLS, et il n'existe même pas de policy INSERT
-- ni DELETE (refus par défaut). Le formulaire "Nouvel admin" échouait donc
-- toujours, en plus de stocker le mot de passe en clair dans password_hash
-- (voir le commentaire "In production, hash this!" resté dans le code).
--
-- Fix, même schéma que admin_update_stand_status/admin_update_talent_status :
-- des RPCs SECURITY DEFINER qui font le vrai travail (dont le hash bcrypt via
-- pgcrypto, déjà activé pour admin_login), accordées à anon comme le reste
-- de l'auth admin custom de cette app.

CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  role text,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email, au.name, au.role, au.is_active, au.created_at, au.updated_at
  FROM public.admin_users au
  ORDER BY au.created_at DESC;
END;
$function$;

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
  VALUES (p_email, p_name, crypt(p_password, gen_salt('bf')), COALESCE(p_role, 'admin'), COALESCE(p_is_active, true))
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_update_user(
  p_id uuid,
  p_email text,
  p_name text,
  p_role text,
  p_is_active boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.admin_users
  SET email = p_email, name = p_name, role = p_role, is_active = p_is_active
  WHERE id = p_id;
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
  SET password_hash = crypt(p_new_password, gen_salt('bf'))
  WHERE id = p_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_delete_user(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Filet de sécurité : ne jamais permettre de supprimer le dernier compte,
  -- pour ne pas se retrouver totalement verrouillé hors du back-office.
  IF (SELECT count(*) FROM public.admin_users) <= 1 THEN
    RAISE EXCEPTION 'Impossible de supprimer le dernier compte administrateur.' USING ERRCODE = 'P0001';
  END IF;

  DELETE FROM public.admin_users WHERE id = p_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.admin_list_users() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_user(text, text, text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user(uuid, text, text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_password(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO anon, authenticated;
