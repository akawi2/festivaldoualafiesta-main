-- Create function to reset all miss candidate votes
CREATE OR REPLACE FUNCTION public.admin_reset_miss_votes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.miss_candidates 
  SET votes_count = 0,
      updated_at = now();
END;
$function$;