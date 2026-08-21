-- Créer un bucket de stockage pour les images des événements du programme
INSERT INTO storage.buckets (id, name, public)
VALUES ('program-events', 'program-events', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre à tout le monde de voir les images
CREATE POLICY "Anyone can view program event images"
ON storage.objects FOR SELECT
USING (bucket_id = 'program-events');

-- Politique pour permettre aux utilisateurs authentifiés de télécharger des images
CREATE POLICY "Authenticated users can upload program event images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'program-events' AND auth.uid() IS NOT NULL);

-- Politique pour permettre aux utilisateurs authentifiés de mettre à jour des images
CREATE POLICY "Authenticated users can update program event images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'program-events' AND auth.uid() IS NOT NULL);

-- Politique pour permettre aux utilisateurs authentifiés de supprimer des images
CREATE POLICY "Authenticated users can delete program event images"
ON storage.objects FOR DELETE
USING (bucket_id = 'program-events' AND auth.uid() IS NOT NULL);