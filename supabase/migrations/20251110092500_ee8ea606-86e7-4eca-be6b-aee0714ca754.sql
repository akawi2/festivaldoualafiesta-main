-- Create RPC function to get all gallery images (including inactive) for admin
CREATE OR REPLACE FUNCTION public.admin_get_gallery_images()
RETURNS SETOF public.gallery_images
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.gallery_images
  ORDER BY display_order ASC;
$$;