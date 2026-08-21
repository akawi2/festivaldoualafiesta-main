-- Ensure bucket is public and allow anonymous uploads for miss-registration-files
UPDATE storage.buckets
SET public = true
WHERE id = 'miss-registration-files';

-- Allow public read on this bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Public can read miss-registration-files'
  ) THEN
    CREATE POLICY "Public can read miss-registration-files"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'miss-registration-files');
  END IF;
END $$;

-- Allow anonymous insert (uploads) to this bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Anyone can upload to miss-registration-files'
  ) THEN
    CREATE POLICY "Anyone can upload to miss-registration-files"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'miss-registration-files');
  END IF;
END $$;