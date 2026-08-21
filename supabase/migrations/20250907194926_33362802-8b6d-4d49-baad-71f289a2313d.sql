-- Create table for program management
CREATE TABLE public.program_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  artist_name TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  stage TEXT NOT NULL DEFAULT 'Scène Principale',
  event_type TEXT NOT NULL DEFAULT 'Concert',
  image_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  ticket_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.program_events ENABLE ROW LEVEL SECURITY;

-- Create policies for program events
CREATE POLICY "Anyone can view active program events" 
ON public.program_events 
FOR SELECT 
USING ((is_active = true) OR (auth.role() = 'authenticated'::text));

CREATE POLICY "Admins can manage program events" 
ON public.program_events 
FOR ALL 
USING (auth.role() = 'authenticated'::text);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_program_events_updated_at
BEFORE UPDATE ON public.program_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample program data
INSERT INTO public.program_events (title, description, artist_name, start_time, end_time, stage, event_type, is_featured) VALUES
('Concert d''Ouverture', 'Spectacle d''ouverture officiel du festival', 'The Douala Stars', '2024-12-15 18:00:00+00', '2024-12-15 19:30:00+00', 'Scène Principale', 'Concert', true),
('DJ Set Électronique', 'Soirée électronique avec les meilleurs DJs', 'DJ Afrika Beat', '2024-12-15 20:00:00+00', '2024-12-15 22:00:00+00', 'Scène Électro', 'DJ Set', false),
('Musique Traditionnelle', 'Spectacle de danses et chants traditionnels', 'Les Maîtres du Makossa', '2024-12-16 16:00:00+00', '2024-12-16 17:30:00+00', 'Scène Culturelle', 'Traditionnel', true),
('Grand Final', 'Concert de clôture avec feux d''artifice', 'African Unity Band', '2024-12-16 21:00:00+00', '2024-12-16 23:30:00+00', 'Scène Principale', 'Concert', true);