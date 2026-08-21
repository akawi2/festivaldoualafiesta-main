-- Replace submit_stand_reservation function with corrected parameter order
-- All parameters with defaults must come after required parameters
CREATE OR REPLACE FUNCTION public.submit_stand_reservation(
  p_stand_type text,
  p_stand_name text,
  p_stand_phone text,
  p_quantity integer DEFAULT 1,
  p_price_fcfa integer DEFAULT NULL,
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
  -- Determine unit price: use provided value or calculate from stand_type
  IF p_price_fcfa IS NOT NULL THEN
    stand_price := p_price_fcfa;
  ELSE
    -- Fallback calculation based on stand_type if not provided
    CASE p_stand_type
      WHEN 'Eco' THEN stand_price := 150000;
      WHEN 'Premium' THEN stand_price := 300000;
      WHEN 'Premium Plus' THEN stand_price := 500000;
      ELSE stand_price := 0;
    END CASE;
  END IF;

  -- Determine total price: use provided value or calculate
  IF p_total_price IS NOT NULL THEN
    calculated_total := p_total_price;
  ELSE
    calculated_total := stand_price * COALESCE(p_quantity, 1);
  END IF;

  INSERT INTO public.stand_reservations (
    stand_type,
    stand_name,
    stand_phone,
    price_fcfa,
    quantity,
    total_price
  ) VALUES (
    p_stand_type,
    p_stand_name,
    p_stand_phone,
    stand_price,
    COALESCE(p_quantity, 1),
    calculated_total
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$function$;