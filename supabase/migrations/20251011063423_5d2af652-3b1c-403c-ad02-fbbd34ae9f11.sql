-- Autoriser l'insertion publique dans miss_gallery_images (temporaire)
DROP POLICY IF EXISTS "Admins can insert miss gallery images" ON public.miss_gallery_images;
CREATE POLICY "Anyone can insert miss gallery images"
ON public.miss_gallery_images
FOR INSERT
WITH CHECK (true);