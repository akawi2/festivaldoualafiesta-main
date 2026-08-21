-- Fix RLS policies for partner-logos bucket
DROP POLICY IF EXISTS "Anyone can view partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete partner logos" ON storage.objects;

-- Create permissive policies for partner-logos bucket
CREATE POLICY "Public can view partner logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'partner-logos');

CREATE POLICY "Public can upload partner logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'partner-logos');

CREATE POLICY "Public can update partner logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'partner-logos')
WITH CHECK (bucket_id = 'partner-logos');

CREATE POLICY "Public can delete partner logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'partner-logos');