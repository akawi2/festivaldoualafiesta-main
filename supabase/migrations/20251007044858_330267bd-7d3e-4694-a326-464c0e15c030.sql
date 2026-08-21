-- Create storage bucket for kwatt heroes images
INSERT INTO storage.buckets (id, name, public)
VALUES ('kwatt-heroes', 'kwatt-heroes', true);

-- Create storage policies for kwatt heroes
CREATE POLICY "Anyone can view kwatt heroes images"
ON storage.objects FOR SELECT
USING (bucket_id = 'kwatt-heroes');

CREATE POLICY "Admins can upload kwatt heroes images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'kwatt-heroes' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can update kwatt heroes images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'kwatt-heroes' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete kwatt heroes images"
ON storage.objects FOR DELETE
USING (bucket_id = 'kwatt-heroes' AND auth.role() = 'authenticated');