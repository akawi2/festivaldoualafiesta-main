-- Renforce les formulaires d'inscription Miss et de réservation de stand :
-- aucun des deux n'avait de protection anti-spam (contrairement au vote), et
-- stand_reservations autorisait n'importe qui à modifier/supprimer les
-- réservations de n'importe qui d'autre.

-- 1) Colonnes pour tracer IP/empreinte (même mécanisme que pour les votes)
ALTER TABLE public.miss_registrations
  ADD COLUMN IF NOT EXISTS submitter_ip text,
  ADD COLUMN IF NOT EXISTS submitter_fingerprint text;

ALTER TABLE public.stand_reservations
  ADD COLUMN IF NOT EXISTS submitter_ip text,
  ADD COLUMN IF NOT EXISTS submitter_fingerprint text;

-- 2) Anti-spam générique : max 3 soumissions par IP par heure sur une table donnée.
-- Assez permissif pour laisser une vraie personne corriger une erreur de saisie,
-- assez strict pour bloquer un script qui spam le formulaire.
CREATE OR REPLACE FUNCTION public.check_submission_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  recent_count integer;
BEGIN
  IF NEW.submitter_ip IS NULL OR NEW.submitter_ip = 'unknown' THEN
    RETURN NEW;
  END IF;

  EXECUTE format(
    'SELECT count(*) FROM public.%I WHERE submitter_ip = $1 AND created_at > now() - interval ''1 hour''',
    TG_TABLE_NAME
  )
  INTO recent_count
  USING NEW.submitter_ip;

  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Trop de soumissions depuis cette adresse, réessayez plus tard.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_check_registration_rate_limit ON public.miss_registrations;
CREATE TRIGGER trg_check_registration_rate_limit
  BEFORE INSERT ON public.miss_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_submission_rate_limit();

DROP TRIGGER IF EXISTS trg_check_stand_reservation_rate_limit ON public.stand_reservations;
CREATE TRIGGER trg_check_stand_reservation_rate_limit
  BEFORE INSERT ON public.stand_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_submission_rate_limit();

-- 3) submit_stand_reservation : accepte désormais l'IP/empreinte du visiteur
CREATE OR REPLACE FUNCTION public.submit_stand_reservation(
  p_stand_type text,
  p_stand_name text,
  p_stand_phone text,
  p_quantity integer DEFAULT 1,
  p_price_fcfa integer DEFAULT NULL,
  p_total_price integer DEFAULT NULL,
  p_ip text DEFAULT NULL,
  p_fingerprint text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_id uuid;
  stand_price integer;
  total_amount integer;
BEGIN
  CASE p_stand_type
    WHEN 'Stand Social' THEN stand_price := 150000;
    WHEN 'Stand Business' THEN stand_price := 500000;
    WHEN 'Stand Partenaire' THEN stand_price := 1000000;
    ELSE stand_price := COALESCE(p_price_fcfa, 0);
  END CASE;

  total_amount := COALESCE(p_total_price, stand_price * p_quantity);

  INSERT INTO public.stand_reservations (
    stand_type,
    stand_name,
    stand_phone,
    quantity,
    price_fcfa,
    total_price,
    submitter_ip,
    submitter_fingerprint
  )
  VALUES (
    p_stand_type,
    p_stand_name,
    p_stand_phone,
    p_quantity,
    stand_price,
    total_amount,
    p_ip,
    p_fingerprint
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$function$;

-- 4) RPCs admin pour gérer le statut des stands, en remplacement des UPDATE
-- directs depuis le client (qui exigeaient une policy publique).
CREATE OR REPLACE FUNCTION public.admin_update_stand_status(p_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.stand_reservations
  SET status = p_status, updated_at = now()
  WHERE id = p_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_update_stand_payment_status(p_id uuid, p_payment_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.stand_reservations
  SET payment_status = p_payment_status, updated_at = now()
  WHERE id = p_id;
END;
$function$;

-- 5) Retire les policies grand-ouvertes : plus personne ne peut modifier/
-- supprimer une réservation via le client anon — seules les RPCs
-- SECURITY DEFINER ci-dessus (utilisées par le panel admin) le peuvent.
DROP POLICY IF EXISTS "Anyone can update stand reservations" ON public.stand_reservations;
DROP POLICY IF EXISTS "Anyone can delete stand reservations" ON public.stand_reservations;
