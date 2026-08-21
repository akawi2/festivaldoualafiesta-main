-- Create a SECURITY DEFINER function to insert program events
CREATE OR REPLACE FUNCTION public.create_program_event(
  p_title text,
  p_description text,
  p_artist_name text,
  p_start_time timestamp with time zone,
  p_end_time timestamp with time zone,
  p_stage text,
  p_event_type text,
  p_image_url text,
  p_is_featured boolean,
  p_is_active boolean,
  p_ticket_info text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.program_events (
    title, 
    description, 
    artist_name, 
    start_time, 
    end_time, 
    stage, 
    event_type, 
    image_url, 
    is_featured, 
    is_active, 
    ticket_info
  )
  VALUES (
    p_title, 
    p_description, 
    p_artist_name, 
    p_start_time, 
    p_end_time, 
    p_stage, 
    p_event_type, 
    p_image_url, 
    COALESCE(p_is_featured, false), 
    COALESCE(p_is_active, true), 
    p_ticket_info
  )
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- Allow public inserts into the program-events storage bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Anyone can upload program event images'
  ) THEN
    CREATE POLICY "Anyone can upload program event images"
    ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'program-events');
  END IF;
END $$;