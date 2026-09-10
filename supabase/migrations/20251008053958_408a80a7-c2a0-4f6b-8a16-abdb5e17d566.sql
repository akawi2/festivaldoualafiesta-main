-- Add quantity and total_price columns to stand_reservations table
ALTER TABLE public.stand_reservations 
ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_price INTEGER;

-- Update existing records to have total_price calculated
UPDATE public.stand_reservations 
SET total_price = price_fcfa * quantity 
WHERE total_price IS NULL;

-- Add constraint to ensure quantity is positive
ALTER TABLE public.stand_reservations 
ADD CONSTRAINT positive_quantity CHECK (quantity > 0);

-- Update the submit_stand_reservation function to handle quantity and total_price
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
  total_amount INTEGER;
BEGIN
  -- Définir le prix selon le type de stand
  CASE p_stand_type
    WHEN 'Stand Social' THEN stand_price := 150000;
    WHEN 'Stand Business' THEN stand_price := 500000;
    WHEN 'Stand Partenaire' THEN stand_price := 1000000;
    ELSE stand_price := 0;
  END CASE;

  -- Calculer le prix total
  total_amount := stand_price * p_quantity;

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
    total_amount
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$function$;