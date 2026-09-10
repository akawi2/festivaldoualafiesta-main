-- Update submit_stand_reservation function to accept and store price and total_price
-- DROP first: CREATE OR REPLACE requires existing parameter names to stay
-- identical, which breaks if the previously-applied version on this
-- project ended up with different parameter names for this same
-- (text,text,text,integer,integer) signature.
DROP FUNCTION IF EXISTS public.submit_stand_reservation(text, text, text, integer, integer);
CREATE OR REPLACE FUNCTION public.submit_stand_reservation(
  p_stand_type text, 
  p_stand_name text, 
  p_stand_phone text, 
  p_quantity integer DEFAULT 1,
  p_total_price integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_id UUID;
  stand_price INTEGER;
  calculated_total INTEGER;
BEGIN
  -- Définir le prix selon le type de stand
  CASE p_stand_type
    WHEN 'Stand Social' THEN stand_price := 150000;
    WHEN 'Stand Business' THEN stand_price := 300000;
    WHEN 'Stand Partenaire' THEN stand_price := 500000;
    ELSE stand_price := 0;
  END CASE;

  -- Utiliser le prix total passé en paramètre, sinon calculer
  IF p_total_price IS NOT NULL THEN
    calculated_total := p_total_price;
  ELSE
    calculated_total := stand_price * p_quantity;
  END IF;

  INSERT INTO public.stand_reservations (
    stand_type, 
    stand_name, 
    stand_phone, 
    price_fcfa, 
    quantity, 
    total_price
  )
  VALUES (
    p_stand_type, 
    p_stand_name, 
    p_stand_phone, 
    stand_price, 
    p_quantity, 
    calculated_total
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$function$;