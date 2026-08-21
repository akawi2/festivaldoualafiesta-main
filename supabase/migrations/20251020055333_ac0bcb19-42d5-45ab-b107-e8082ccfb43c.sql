-- Supprimer l'ancienne politique restrictive
DROP POLICY IF EXISTS "Admins can manage categories" ON public.gallery_categories;

-- Créer des politiques plus permissives pour l'administration des catégories
CREATE POLICY "Anyone can insert categories"
ON public.gallery_categories
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can update categories"
ON public.gallery_categories
FOR UPDATE
TO public
USING (true);

CREATE POLICY "Anyone can delete categories"
ON public.gallery_categories
FOR DELETE
TO public
USING (true);