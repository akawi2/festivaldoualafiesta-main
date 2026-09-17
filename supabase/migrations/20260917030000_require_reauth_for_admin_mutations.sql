-- Les 4 RPC admin_create_user/admin_update_user/admin_update_user_password/
-- admin_delete_user (20260917000000/010000) sont accordées à anon comme le
-- reste des RPC admin de cette app (admin_login, admin_update_stand_status,
-- ...), pour la même raison : pas de Supabase Auth ici, l'auth admin est
-- entièrement custom. Mais contrairement aux autres, celles-ci touchent
-- directement qui a accès au back-office : n'importe qui connaissant la clé
-- anon (publique, visible dans le bundle JS) pouvait appeler
-- admin_create_user sans jamais passer par /admin et s'auto-attribuer un
-- compte admin. On ferme ce trou en exigeant email+mot de passe d'un admin
-- déjà actif sur chacune de ces 4 RPC (vérifiés via le même mécanisme que
-- admin_login). admin_list_users (lecture seule) reste inchangée.

CREATE OR REPLACE FUNCTION public.admin_verify_credentials(p_email text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.email = p_email
      AND au.is_active = true
      AND au.password_hash = extensions.crypt(p_password, au.password_hash)
  );
END;
$function$;

-- Les anciennes signatures (sans ré-auth) doivent être supprimées, sinon
-- elles restent appelables en parallèle des nouvelles et le trou reste ouvert.
DROP FUNCTION IF EXISTS public.admin_create_user(text, text, text, text, boolean);
DROP FUNCTION IF EXISTS public.admin_update_user(uuid, text, text, text, boolean);
DROP FUNCTION IF EXISTS public.admin_update_user_password(uuid, text);
DROP FUNCTION IF EXISTS public.admin_delete_user(uuid);

CREATE OR REPLACE FUNCTION public.admin_create_user(
  p_acting_email text,
  p_acting_password text,
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
  IF NOT public.admin_verify_credentials(p_acting_email, p_acting_password) THEN
    RAISE EXCEPTION 'Authentification administrateur requise.' USING ERRCODE = 'P0001';
  END IF;

  IF p_password IS NULL OR length(p_password) < 6 THEN
    RAISE EXCEPTION 'Le mot de passe doit contenir au moins 6 caractères.' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.admin_users (email, name, password_hash, role, is_active)
  VALUES (p_email, p_name, extensions.crypt(p_password, extensions.gen_salt('bf')), COALESCE(p_role, 'admin'), COALESCE(p_is_active, true))
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_update_user(
  p_acting_email text,
  p_acting_password text,
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
  IF NOT public.admin_verify_credentials(p_acting_email, p_acting_password) THEN
    RAISE EXCEPTION 'Authentification administrateur requise.' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.admin_users
  SET email = p_email, name = p_name, role = p_role, is_active = p_is_active
  WHERE id = p_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_update_user_password(
  p_acting_email text,
  p_acting_password text,
  p_id uuid,
  p_new_password text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.admin_verify_credentials(p_acting_email, p_acting_password) THEN
    RAISE EXCEPTION 'Authentification administrateur requise.' USING ERRCODE = 'P0001';
  END IF;

  IF p_new_password IS NULL OR length(p_new_password) < 6 THEN
    RAISE EXCEPTION 'Le mot de passe doit contenir au moins 6 caractères.' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.admin_users
  SET password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf'))
  WHERE id = p_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_delete_user(
  p_acting_email text,
  p_acting_password text,
  p_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.admin_verify_credentials(p_acting_email, p_acting_password) THEN
    RAISE EXCEPTION 'Authentification administrateur requise.' USING ERRCODE = 'P0001';
  END IF;

  IF (SELECT count(*) FROM public.admin_users) <= 1 THEN
    RAISE EXCEPTION 'Impossible de supprimer le dernier compte administrateur.' USING ERRCODE = 'P0001';
  END IF;

  DELETE FROM public.admin_users WHERE id = p_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.admin_create_user(text, text, text, text, text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user(text, text, uuid, text, text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_password(text, text, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(text, text, uuid) TO anon, authenticated;
-- admin_verify_credentials n'est PAS accordée à anon : elle ne sert qu'en
-- interne aux fonctions ci-dessus (SECURITY DEFINER), l'exposer
-- permettrait de tester des mots de passe en aveugle (oracle d'auth).
