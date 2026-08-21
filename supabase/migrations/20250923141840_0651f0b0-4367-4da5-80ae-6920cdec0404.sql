-- Migration complète pour supporter tous les formulaires du site

-- 1. Table pour les demandes de devis (ContactSection - formulaire de devis)
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_type TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Table pour les réservations de places (ContactSection - Book ta place)
CREATE TABLE IF NOT EXISTS public.spot_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_site TEXT NOT NULL,
  festival_day TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Table pour les réservations de stands (ContactSection - Réservation de Stand)
CREATE TABLE IF NOT EXISTS public.stand_reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stand_type TEXT NOT NULL,
  stand_name TEXT NOT NULL,
  stand_phone TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_fcfa INTEGER,
  price_total INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Table pour les inscriptions Miss (MissElection - formulaire d'inscription)
CREATE TABLE IF NOT EXISTS public.miss_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  city TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  description TEXT,
  experience TEXT,
  hobbies TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Mise à jour de la table miss_votes pour inclure plus d'informations de tracking
ALTER TABLE public.miss_votes 
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS vote_type TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- 6. Table pour stocker les sessions de vote pour éviter les votes multiples
CREATE TABLE IF NOT EXISTS public.voting_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  voter_ip TEXT,
  voter_fingerprint TEXT,
  votes_count INTEGER DEFAULT 0,
  last_vote_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id)
);

-- Enable RLS sur toutes les nouvelles tables
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spot_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stand_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miss_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_sessions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour quote_requests
CREATE POLICY "Admins can manage quote requests" 
ON public.quote_requests 
FOR ALL 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Anyone can submit quote requests" 
ON public.quote_requests 
FOR INSERT 
WITH CHECK (true);

-- Politiques RLS pour spot_bookings
CREATE POLICY "Admins can manage spot bookings" 
ON public.spot_bookings 
FOR ALL 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Anyone can create spot bookings" 
ON public.spot_bookings 
FOR INSERT 
WITH CHECK (true);

-- Politiques RLS pour stand_reservations
CREATE POLICY "Admins can manage stand reservations" 
ON public.stand_reservations 
FOR ALL 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Anyone can create stand reservations" 
ON public.stand_reservations 
FOR INSERT 
WITH CHECK (true);

-- Politiques RLS pour miss_registrations
CREATE POLICY "Admins can manage miss registrations" 
ON public.miss_registrations 
FOR ALL 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Anyone can submit miss registrations" 
ON public.miss_registrations 
FOR INSERT 
WITH CHECK (true);

-- Politiques RLS pour voting_sessions
CREATE POLICY "Anyone can manage their voting session" 
ON public.voting_sessions 
FOR ALL 
USING (true);

-- Triggers pour updated_at
CREATE TRIGGER update_quote_requests_updated_at
BEFORE UPDATE ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_spot_bookings_updated_at
BEFORE UPDATE ON public.spot_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stand_reservations_updated_at
BEFORE UPDATE ON public.stand_reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_miss_registrations_updated_at
BEFORE UPDATE ON public.miss_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fonctions utilitaires pour les formulaires
CREATE OR REPLACE FUNCTION public.submit_quote_request(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_event_type TEXT,
  p_message TEXT
) RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.quote_requests (name, email, phone, event_type, message)
  VALUES (p_name, p_email, p_phone, p_event_type, p_message)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.submit_spot_booking(
  p_first_name TEXT,
  p_last_name TEXT,
  p_phone TEXT,
  p_event_site TEXT,
  p_festival_day TEXT
) RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.spot_bookings (first_name, last_name, phone, event_site, festival_day)
  VALUES (p_first_name, p_last_name, p_phone, p_event_site, p_festival_day)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.submit_stand_reservation(
  p_stand_type TEXT,
  p_stand_name TEXT,
  p_stand_phone TEXT,
  p_quantity INTEGER, -- PARAMÈTRE AJOUTÉ
  p_price_fcfa INTEGER,
  p_total_price INTEGER
) RETURNS UUID AS $$
DECLARE
  new_id UUID;
  stand_price INTEGER;
BEGIN
  -- Définir le prix selon le type de stand
/*  CASE p_stand_type
    WHEN 'Stand Social' THEN stand_price := 150000;
    WHEN 'Stand Business' THEN stand_price := 300000;
    WHEN 'Stand Partenaire' THEN stand_price := 500000;
    ELSE stand_price := 0;
  END CASE;
*/
  INSERT INTO public.stand_reservations (stand_type, stand_name, stand_phone, price_fcfa, total_price)
  VALUES (p_stand_type, p_stand_name, p_stand_phone, p_price_fcfa, p_total_price)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.submit_miss_registration(
  p_name TEXT,
  p_age INTEGER,
  p_city TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_description TEXT,
  p_experience TEXT,
  p_hobbies TEXT
) RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.miss_registrations (name, age, city, email, phone, description, experience, hobbies)
  VALUES (p_name, p_age, p_city, p_email, p_phone, p_description, p_experience, p_hobbies)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;