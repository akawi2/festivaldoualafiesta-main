-- Corrige la dérive entre les migrations versionnées et le vrai schéma de
-- production, découverte en rejouant l'export de données réel sur une
-- instance self-hosted fraîche (colonnes/bucket ajoutés via le dashboard à
-- l'époque, jamais capturés dans une migration). Sans ce fichier, charger un
-- export de données réel échoue avec des erreurs "column does not exist".

ALTER TABLE public.gallery_categories
  ADD COLUMN IF NOT EXISTS name_en text;

ALTER TABLE public.miss_candidates
  ADD COLUMN IF NOT EXISTS description_fr text,
  ADD COLUMN IF NOT EXISTS description_en text;

ALTER TABLE public.miss_gallery_images
  ADD COLUMN IF NOT EXISTS category text;

ALTER TABLE public.miss_registrations
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS "date de naissance" text,
  ADD COLUMN IF NOT EXISTS profession text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS borough text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS card_url text,
  ADD COLUMN IF NOT EXISTS auth_url text;

-- Plus utilisée en production (remplacée par first_name/name) mais toujours
-- NOT NULL dans le schéma d'origine — bloquerait l'import de tout export réel.
ALTER TABLE public.miss_registrations ALTER COLUMN email DROP NOT NULL;

-- site_settings.value était jsonb dans la migration d'origine, mais la vraie
-- production stocke des valeurs texte brutes ("true", "contact@..."), pas du
-- JSON valide.
ALTER TABLE public.site_settings ALTER COLUMN value TYPE text USING value::text;

-- Bucket utilisé en production (miss-registration-files) mais jamais créé par
-- une migration — seules ses policies le sont (voir 20251003221118...sql).
-- Sans ce bucket, l'upload/l'import des photos d'inscription échoue.
INSERT INTO storage.buckets (id, name, public)
VALUES ('miss-registration-files', 'miss-registration-files', true)
ON CONFLICT (id) DO NOTHING;
