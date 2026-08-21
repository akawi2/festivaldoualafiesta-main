-- Add voting and registration control settings to site_settings table
INSERT INTO public.site_settings (key, value, description, category)
VALUES 
  ('voting_enabled', 'true', 'Activer ou désactiver les votes pour le concours Miss', 'general'),
  ('registration_enabled', 'true', 'Activer ou désactiver les inscriptions pour le concours Miss', 'general')
ON CONFLICT (key) DO NOTHING;