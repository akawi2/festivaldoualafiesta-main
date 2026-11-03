-- Formulaire "Jeunes talents" : on demande aussi l'âge. Compatible avec le
-- front actuellement en ligne (p_age est optionnel, donc l'ancien appel à 7
-- paramètres nommés continue de fonctionner).
ALTER TABLE public.talent_submissions
  ADD COLUMN IF NOT EXISTS age integer CHECK (age IS NULL OR age BETWEEN 5 AND 99);

DROP FUNCTION IF EXISTS public.submit_talent_application(text, text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.submit_talent_application(
  p_name text,
  p_stage_name text,
  p_phone text,
  p_quartier text,
  p_arrondissement text,
  p_participation_type text,
  p_talent_description text,
  p_age integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.talent_submissions (
    name, stage_name, phone, quartier, arrondissement, participation_type, talent_description, age
  )
  VALUES (
    p_name, p_stage_name, p_phone, p_quartier, p_arrondissement, p_participation_type, p_talent_description, p_age
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.submit_talent_application(text, text, text, text, text, text, text, integer) TO anon, authenticated;
