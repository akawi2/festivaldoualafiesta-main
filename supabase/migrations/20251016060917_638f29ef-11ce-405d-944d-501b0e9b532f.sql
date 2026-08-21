-- Fix parameter order: required params first, optional (with defaults) last

-- 1) Admin upsert for miss_candidates
CREATE OR REPLACE FUNCTION public.admin_upsert_miss_candidate(
  p_name text,
  p_age integer,
  p_city text,
  p_description_fr text,
  p_id uuid DEFAULT NULL,
  p_description_en text DEFAULT NULL,
  p_image_url text DEFAULT NULL,
  p_is_active boolean DEFAULT true
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  IF p_id IS NULL THEN
    INSERT INTO public.miss_candidates (
      name, age, city, description_fr, description_en, image_url, is_active
    ) VALUES (
      p_name, p_age, p_city, p_description_fr, p_description_en, p_image_url, COALESCE(p_is_active, true)
    ) RETURNING id INTO new_id;
  ELSE
    UPDATE public.miss_candidates
    SET
      name = p_name,
      age = p_age,
      city = p_city,
      description_fr = p_description_fr,
      description_en = p_description_en,
      image_url = p_image_url,
      is_active = COALESCE(p_is_active, is_active),
      updated_at = now()
    WHERE id = p_id
    RETURNING id INTO new_id;
  END IF;

  RETURN new_id;
END;
$$;

-- 2) Admin update for program_events
CREATE OR REPLACE FUNCTION public.admin_update_program_event(
  p_id uuid,
  p_title text,
  p_artist_name text,
  p_start_time timestamp with time zone,
  p_end_time timestamp with time zone,
  p_stage text,
  p_event_type text,
  p_description_fr text DEFAULT NULL,
  p_description_en text DEFAULT NULL,
  p_image_url text DEFAULT NULL,
  p_is_featured boolean DEFAULT NULL,
  p_is_active boolean DEFAULT NULL,
  p_ticket_info text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_id uuid;
BEGIN
  UPDATE public.program_events
  SET
    title = p_title,
    description_fr = p_description_fr,
    description_en = p_description_en,
    artist_name = p_artist_name,
    start_time = p_start_time,
    end_time = p_end_time,
    stage = p_stage,
    event_type = p_event_type,
    image_url = p_image_url,
    is_featured = COALESCE(p_is_featured, is_featured),
    is_active = COALESCE(p_is_active, is_active),
    ticket_info = p_ticket_info,
    updated_at = now()
  WHERE id = p_id
  RETURNING id INTO updated_id;

  IF updated_id IS NULL THEN
    RAISE EXCEPTION 'No program_event found with id %', p_id USING ERRCODE = 'P0002';
  END IF;

  RETURN updated_id;
END;
$$;

-- 3) Admin upsert for gallery_images
CREATE OR REPLACE FUNCTION public.admin_upsert_gallery_image(
  p_title text,
  p_category text,
  p_image_url text,
  p_id uuid DEFAULT NULL,
  p_description_fr text DEFAULT NULL,
  p_description_en text DEFAULT NULL,
  p_is_active boolean DEFAULT true,
  p_display_order integer DEFAULT 0
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  IF p_id IS NULL THEN
    INSERT INTO public.gallery_images (
      title, category, description_fr, description_en, image_url, is_active, display_order
    ) VALUES (
      p_title, p_category, p_description_fr, p_description_en, p_image_url, COALESCE(p_is_active, true), COALESCE(p_display_order, 0)
    ) RETURNING id INTO new_id;
  ELSE
    UPDATE public.gallery_images
    SET
      title = p_title,
      category = p_category,
      description_fr = p_description_fr,
      description_en = p_description_en,
      image_url = p_image_url,
      is_active = COALESCE(p_is_active, is_active),
      display_order = COALESCE(p_display_order, display_order),
      updated_at = now()
    WHERE id = p_id
    RETURNING id INTO new_id;
  END IF;

  RETURN new_id;
END;
$$;