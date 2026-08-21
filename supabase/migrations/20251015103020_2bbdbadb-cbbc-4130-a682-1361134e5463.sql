-- Create partners table
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  partner_type TEXT NOT NULL,
  website_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active partners"
  ON public.partners
  FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admins can manage partners"
  ON public.partners
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for partner logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-logos', 'partner-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Anyone can view partner logos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'partner-logos');

CREATE POLICY "Authenticated users can upload partner logos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'partner-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update partner logos"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'partner-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete partner logos"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'partner-logos' AND auth.role() = 'authenticated');