-- Fix RLS policies for gallery_images to allow public insertion
DROP POLICY "Admins can manage gallery images" ON public.gallery_images;

-- Create separate policies for better security
CREATE POLICY "Anyone can insert gallery images" 
ON public.gallery_images 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update gallery images" 
ON public.gallery_images 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete gallery images" 
ON public.gallery_images 
FOR DELETE 
USING (auth.role() = 'authenticated');