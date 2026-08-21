-- Supprimer les anciennes politiques restrictives sur le bucket miss-gallery
DROP POLICY IF EXISTS "Admins can upload miss gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete miss gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update miss gallery images" ON storage.objects;

-- Vérifier et supprimer toute politique existante qui pourrait bloquer
DROP POLICY IF EXISTS "Anyone can view miss gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload miss gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete miss gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update miss gallery images" ON storage.objects;

-- Créer les nouvelles politiques publiques
CREATE POLICY "Public can view miss gallery"
ON storage.objects
FOR SELECT
USING (bucket_id = 'miss-gallery');

CREATE POLICY "Public can insert miss gallery"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'miss-gallery');

CREATE POLICY "Public can delete miss gallery"
ON storage.objects
FOR DELETE
USING (bucket_id = 'miss-gallery');

CREATE POLICY "Public can update miss gallery"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'miss-gallery');