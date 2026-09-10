-- Supprimer les anciennes politiques pour le bucket program-events
DROP POLICY IF EXISTS "Authenticated users can upload program event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update program event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete program event images" ON storage.objects;

-- Créer de nouvelles politiques compatibles avec l'authentification admin
CREATE POLICY "Anyone authenticated can upload program event images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'program-events' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can update program event images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'program-events' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone authenticated can delete program event images"
ON storage.objects FOR DELETE
USING (bucket_id = 'program-events' AND auth.role() = 'authenticated');

-- Modifier les politiques de la table program_events
DROP POLICY IF EXISTS "Authenticated users can manage program events" ON program_events;
-- Already created by 20250907194926; guard against replaying this
-- migration on a fresh project.
DROP POLICY IF EXISTS "Admins can manage program events" ON program_events;

CREATE POLICY "Admins can manage program events"
ON program_events FOR ALL
USING (auth.role() = 'authenticated');