-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can upload kwatt heroes images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update kwatt heroes images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete kwatt heroes images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage heroes" ON public.kwatt_heroes;

-- Create permissive policies for storage
CREATE POLICY "Anyone can upload kwatt heroes images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'kwatt-heroes');

CREATE POLICY "Anyone can update kwatt heroes images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'kwatt-heroes');

CREATE POLICY "Anyone can delete kwatt heroes images"
ON storage.objects FOR DELETE
USING (bucket_id = 'kwatt-heroes');

-- Create permissive policies for kwatt_heroes table
CREATE POLICY "Anyone can insert heroes"
ON public.kwatt_heroes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update heroes"
ON public.kwatt_heroes FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete heroes"
ON public.kwatt_heroes FOR DELETE
USING (true);