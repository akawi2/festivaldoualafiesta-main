-- Ajouter la colonne place_it à la table gallery_categories
ALTER TABLE public.gallery_categories
ADD COLUMN IF NOT EXISTS place_it TEXT;