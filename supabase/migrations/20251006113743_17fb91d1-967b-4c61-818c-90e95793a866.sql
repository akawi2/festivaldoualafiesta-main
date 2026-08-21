-- Create table for heroes (Héros du Kwatt)
CREATE TABLE public.kwatt_heroes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.kwatt_heroes ENABLE ROW LEVEL SECURITY;

-- Create policies for heroes
CREATE POLICY "Anyone can view active heroes" 
ON public.kwatt_heroes 
FOR SELECT 
USING ((is_active = true) OR (auth.role() = 'authenticated'));

CREATE POLICY "Admins can manage heroes" 
ON public.kwatt_heroes 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Create table for hero likes
CREATE TABLE public.kwatt_hero_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_id UUID NOT NULL REFERENCES public.kwatt_heroes(id) ON DELETE CASCADE,
  voter_ip TEXT,
  voter_fingerprint TEXT,
  session_id TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for likes
ALTER TABLE public.kwatt_hero_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for likes
CREATE POLICY "Anyone can view hero likes" 
ON public.kwatt_hero_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert hero likes" 
ON public.kwatt_hero_likes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage hero likes" 
ON public.kwatt_hero_likes 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Create function to increment hero likes
CREATE OR REPLACE FUNCTION public.increment_hero_likes(hero_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.kwatt_heroes 
  SET likes_count = likes_count + 1 
  WHERE id = hero_uuid;
END;
$function$;

-- Create trigger for updated_at
CREATE TRIGGER update_kwatt_heroes_updated_at
BEFORE UPDATE ON public.kwatt_heroes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();