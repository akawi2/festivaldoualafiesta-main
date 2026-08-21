-- Correction des problèmes de sécurité détectés par le linter

-- Mise à jour des fonctions pour inclure le search_path sécurisé
CREATE OR REPLACE FUNCTION public.submit_quote_request(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_event_type TEXT,
  p_message TEXT
) RETURNS UUID
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.quote_requests (name, email, phone, event_type, message)
  VALUES (p_name, p_email, p_phone, p_event_type, p_message)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_spot_booking(
  p_first_name TEXT,
  p_last_name TEXT,
  p_phone TEXT,
  p_event_site TEXT,
  p_festival_day TEXT
) RETURNS UUID
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.spot_bookings (first_name, last_name, phone, event_site, festival_day)
  VALUES (p_first_name, p_last_name, p_phone, p_event_site, p_festival_day)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_stand_reservation(
  p_stand_type TEXT,
  p_stand_name TEXT,
  p_stand_phone TEXT,
  p_total_price INTEGER
) RETURNS UUID
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
  stand_price INTEGER;
BEGIN
  -- Définir le prix selon le type de stand
  CASE p_stand_type
    WHEN 'Stand Social' THEN stand_price := 150000;
    WHEN 'Stand Business' THEN stand_price := 300000;
    WHEN 'Stand Partenaire' THEN stand_price := 500000;
    ELSE stand_price := 0;
  END CASE;

  INSERT INTO public.stand_reservations (stand_type, stand_name, stand_phone, price_fcfa, total_price)
  VALUES (p_stand_type, p_stand_name, p_stand_phone, stand_price, p_total_price)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_miss_registration(
  p_name TEXT,
  p_age INTEGER,
  p_city TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_description TEXT,
  p_experience TEXT,
  p_hobbies TEXT
) RETURNS UUID
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.miss_registrations (name, age, city, email, phone, description, experience, hobbies)
  VALUES (p_name, p_age, p_city, p_email, p_phone, p_description, p_experience, p_hobbies)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Mise à jour de la fonction increment_candidate_votes pour inclure le search_path
CREATE OR REPLACE FUNCTION public.increment_candidate_votes(candidate_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.miss_candidates 
  SET votes_count = votes_count + 1 
  WHERE id = candidate_uuid;
END;
$$;