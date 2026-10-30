-- Les boutons "Ouvrir/Fermer les inscriptions" et "Activer/Geler les votes" du
-- back-office ne sauvegardaient rien : site_settings n'a de policy d'écriture
-- que pour auth.role() = 'authenticated' (Supabase Auth, jamais utilisé ici),
-- donc l'UPDATE du client anon touche 0 ligne, sans erreur. L'interface
-- affichait un succès et l'état local changeait, mais la base restait
-- inchangée (registration_enabled = false depuis le 15 février) : au
-- rechargement, retour à "fermé".
--
-- Même correctif que pour admin_users : RPC SECURITY DEFINER, qui exige en
-- plus l'email + mot de passe d'un admin actif (ces deux réglages décident
-- si le public peut s'inscrire / voter, ils ne doivent pas être modifiables
-- avec la seule clé anon publique).
CREATE OR REPLACE FUNCTION public.admin_update_site_setting(
  p_acting_email text,
  p_acting_password text,
  p_key text,
  p_value boolean
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

  IF p_key NOT IN ('voting_enabled', 'registration_enabled') THEN
    RAISE EXCEPTION 'Réglage inconnu.' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.site_settings (key, value, category, description)
  VALUES (p_key, to_jsonb(p_value), 'general', NULL)
  ON CONFLICT (key) DO UPDATE SET value = to_jsonb(p_value), updated_at = now();
END;
$function$;

GRANT EXECUTE ON FUNCTION public.admin_update_site_setting(text, text, text, boolean) TO anon, authenticated;
