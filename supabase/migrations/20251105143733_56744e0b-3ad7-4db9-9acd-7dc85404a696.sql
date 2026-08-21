-- Fix admin_reset_miss_votes function to include WHERE clause
CREATE OR REPLACE FUNCTION public.admin_reset_miss_votes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.miss_candidates 
  SET votes_count = 0,
      updated_at = now()
  WHERE id IS NOT NULL;
END;
$function$;