-- Renforce l'intégrité des votes Miss côté serveur, indépendamment du client.
-- L'IP et l'empreinte envoyées par le navigateur peuvent toujours être falsifiées
-- par un script qui appelle l'API directement ; cette protection ne dépend donc
-- que de voter_ip, qui provient désormais d'un vrai lookup IP côté client
-- (voir src/utils/voterIdentity.ts) plutôt que d'être codé en dur à "unknown".

CREATE OR REPLACE FUNCTION public.check_vote_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Skip la vérification si l'IP n'a pas pu être déterminée côté client
  -- (échec réseau) : on préfère laisser passer le vote plutôt que de
  -- bloquer un votant légitime sur un faux négatif.
  IF NEW.voter_ip IS NULL OR NEW.voter_ip = 'unknown' THEN
    RETURN NEW;
  END IF;

  -- Une même IP ne peut pas revoter pour la même candidate dans les
  -- dernières 24h, même avec une empreinte différente (empêche de
  -- contourner la limite en changeant de navigateur/fenêtre privée).
  IF EXISTS (
    SELECT 1 FROM public.miss_votes
    WHERE candidate_id = NEW.candidate_id
      AND voter_ip = NEW.voter_ip
      AND created_at > now() - interval '24 hours'
  ) THEN
    RAISE EXCEPTION 'Vous avez déjà voté pour cette candidate aujourd''hui.'
      USING ERRCODE = 'P0001';
  END IF;

  -- Anti-burst : une même IP ne peut pas dépasser 20 votes (toutes
  -- candidates confondues) en moins d'une heure, signe probable d'un
  -- script plutôt que d'une personne réelle.
  IF (
    SELECT count(*) FROM public.miss_votes
    WHERE voter_ip = NEW.voter_ip
      AND created_at > now() - interval '1 hour'
  ) >= 20 THEN
    RAISE EXCEPTION 'Trop de votes détectés depuis cette adresse, réessayez plus tard.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_check_vote_rate_limit ON public.miss_votes;

CREATE TRIGGER trg_check_vote_rate_limit
  BEFORE INSERT ON public.miss_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.check_vote_rate_limit();
