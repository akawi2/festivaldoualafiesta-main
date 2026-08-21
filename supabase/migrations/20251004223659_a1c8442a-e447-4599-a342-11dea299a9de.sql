-- Create a SECURITY DEFINER function to insert miss candidates
CREATE OR REPLACE FUNCTION public.create_miss_candidate(
  p_name text,
  p_age integer,
  p_city text,
  p_description text,
  p_image_url text,
  p_is_active boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.miss_candidates (name, age, city, description, image_url, is_active)
  VALUES (p_name, p_age, p_city, p_description, p_image_url, COALESCE(p_is_active, true))
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- Allow public inserts into the specific storage bucket for uploads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Anyone can upload miss candidate images'
  ) THEN
    CREATE POLICY "Anyone can upload miss candidate images"
    ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'miss-registration-files');
  END IF;
END $$;