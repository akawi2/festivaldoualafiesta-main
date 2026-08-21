-- Politiques pour le bucket miss-registration-files
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view files" ON storage.objects;

-- Créer les politiques pour permettre les uploads admin
CREATE POLICY "Anyone authenticated can upload to miss-registration-files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'miss-registration-files' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can update miss-registration-files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'miss-registration-files' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can delete from miss-registration-files"
ON storage.objects FOR DELETE
USING (bucket_id = 'miss-registration-files' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view miss-registration-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'miss-registration-files');