-- Create gallery categories table
CREATE TABLE public.gallery_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active categories" 
ON public.gallery_categories 
FOR SELECT 
USING ((is_active = true) OR (auth.role() = 'authenticated'));

CREATE POLICY "Admins can manage categories" 
ON public.gallery_categories 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Insert default categories
INSERT INTO public.gallery_categories (name, display_order) VALUES
  ('Concert', 1),
  ('Électronique', 2),
  ('Traditionnel', 3),
  ('Spectacle', 4),
  ('Animation', 5),
  ('Ambiance', 6),
  ('Général', 7);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gallery_categories_updated_at
BEFORE UPDATE ON public.gallery_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();