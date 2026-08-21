-- Create storage bucket for miss gallery images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'miss-gallery',
  'miss-gallery',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

-- Create storage policies for miss gallery bucket
CREATE POLICY "Anyone can view miss gallery images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'miss-gallery');

CREATE POLICY "Admins can upload miss gallery images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'miss-gallery' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can update miss gallery images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'miss-gallery' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete miss gallery images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'miss-gallery' AND auth.role() = 'authenticated');

-- Create miss_gallery_images table
CREATE TABLE public.miss_gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  miss_candidate_id UUID REFERENCES public.miss_candidates(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.miss_gallery_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view miss gallery images"
ON public.miss_gallery_images
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert miss gallery images"
ON public.miss_gallery_images
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update miss gallery images"
ON public.miss_gallery_images
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete miss gallery images"
ON public.miss_gallery_images
FOR DELETE
USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_miss_gallery_images_updated_at
BEFORE UPDATE ON public.miss_gallery_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();