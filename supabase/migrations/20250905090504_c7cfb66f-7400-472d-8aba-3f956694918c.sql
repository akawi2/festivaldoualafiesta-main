-- Create table for gallery management
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Général',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policies for gallery images
CREATE POLICY "Anyone can view active gallery images" 
ON public.gallery_images 
FOR SELECT 
USING ((is_active = true) OR (auth.role() = 'authenticated'::text));

CREATE POLICY "Admins can manage gallery images" 
ON public.gallery_images 
FOR ALL 
USING (auth.role() = 'authenticated'::text);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gallery_images_updated_at
BEFORE UPDATE ON public.gallery_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing gallery data
INSERT INTO public.gallery_images (title, description, image_url, category, display_order) VALUES
('Concert Principal', 'Scène principale avec spectacle live en soirée', '/src/assets/festival-concert-1.jpg', 'Concert', 1),
('DJ Set Électro', 'Performance DJ avec éclairages spectaculaires', '/src/assets/festival-dj-2.jpg', 'Électronique', 2),
('Musique Africaine', 'Festival de musiques traditionnelles et modernes', '/src/assets/festival-african-3.jpg', 'Traditionnel', 3),
('Scène Principale', 'Grand spectacle avec pyrotechnie et effets spéciaux', '/src/assets/festival-mainstage-4.jpg', 'Spectacle', 4),
('Zone Restauration', 'Espace convivial pour se restaurer entre concerts', '/src/assets/festival-food-5.jpg', 'Animation', 5),
('Vue Artiste', 'L''euphorie du public vue depuis la scène', '/src/assets/festival-crowd-6.jpg', 'Ambiance', 6);