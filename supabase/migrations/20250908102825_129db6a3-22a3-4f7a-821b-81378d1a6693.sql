-- Supprimer les tables de billetterie existantes
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.ticket_types;

-- Créer table des candidates Miss
CREATE TABLE public.miss_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER,
  city TEXT,
  description TEXT,
  image_url TEXT,
  votes_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Créer table des votes
CREATE TABLE public.miss_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.miss_candidates(id) ON DELETE CASCADE,
  voter_ip TEXT,
  voter_fingerprint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, voter_ip, voter_fingerprint)
);

-- Enable RLS
ALTER TABLE public.miss_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miss_votes ENABLE ROW LEVEL SECURITY;

-- Policies pour candidates
CREATE POLICY "Anyone can view active candidates" 
ON public.miss_candidates 
FOR SELECT 
USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admins can manage candidates" 
ON public.miss_candidates 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Policies pour votes
CREATE POLICY "Anyone can insert votes" 
ON public.miss_votes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view votes" 
ON public.miss_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage votes" 
ON public.miss_votes 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_miss_candidates_updated_at
  BEFORE UPDATE ON public.miss_candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour incrémenter les votes
CREATE OR REPLACE FUNCTION public.increment_candidate_votes(candidate_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.miss_candidates 
  SET votes_count = votes_count + 1 
  WHERE id = candidate_uuid;
END;
$$;