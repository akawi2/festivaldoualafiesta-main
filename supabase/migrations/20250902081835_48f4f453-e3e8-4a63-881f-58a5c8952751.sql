-- Create admin users table for site management
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin users
CREATE POLICY "Admins can view all admin users" 
ON public.admin_users 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update admin users" 
ON public.admin_users 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Update trigger for admin_users
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create site_settings table for managing site content
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.admin_users(id)
);

-- Enable RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies for site_settings
CREATE POLICY "Anyone can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Update trigger for site_settings
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update ticket_types policies to allow admin management
DROP POLICY IF EXISTS "Anyone can view active ticket types" ON public.ticket_types;

CREATE POLICY "Anyone can view active ticket types" 
ON public.ticket_types 
FOR SELECT 
USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admins can manage ticket types" 
ON public.ticket_types 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Insert default site settings
INSERT INTO public.site_settings (key, value, description, category) VALUES
('site_title', '"Douala Fiesta"', 'Titre principal du site', 'general'),
('hero_title', '"DOUALA FIESTA 2024"', 'Titre de la section hero', 'homepage'),
('hero_subtitle', '"L''événement musical de l''année à Douala"', 'Sous-titre de la section hero', 'homepage'),
('hero_description', '"Rejoignez-nous pour une soirée inoubliable avec les plus grands artistes de la scène musicale camerounaise et internationale."', 'Description de la section hero', 'homepage'),
('contact_email', '"contact@doualafiestaevents.com"', 'Email de contact principal', 'contact'),
('contact_phone', '"+237 6XX XXX XXX"', 'Téléphone de contact', 'contact'),
('contact_address', '"Douala, Cameroun"', 'Adresse de contact', 'contact'),
('social_facebook', '"https://facebook.com/doualafiestaevents"', 'URL Facebook', 'social'),
('social_instagram', '"https://instagram.com/doualafiestaevents"', 'URL Instagram', 'social'),
('social_twitter', '"https://twitter.com/doualafiestaevents"', 'URL Twitter', 'social');