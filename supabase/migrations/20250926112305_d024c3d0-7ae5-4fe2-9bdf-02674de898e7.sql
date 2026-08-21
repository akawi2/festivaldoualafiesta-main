-- Add 'taille' column to miss_registrations table
ALTER TABLE public.miss_registrations 
ADD COLUMN taille TEXT;

-- Update the submit_miss_registration function to include the new taille parameter
CREATE OR REPLACE FUNCTION public.submit_miss_registration(
  p_name text, 
  p_age integer, 
  p_city text, 
  p_email text, 
  p_phone text, 
  p_description text, 
  p_experience text, 
  p_hobbies text,
  p_taille text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.miss_registrations (name, age, city, email, phone, description, experience, hobbies, taille)
  VALUES (p_name, p_age, p_city, p_email, p_phone, p_description, p_experience, p_hobbies, p_taille)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$function$;