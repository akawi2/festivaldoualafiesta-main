-- Le bucket miss-registration-files a perdu 'application/pdf' de sa liste de
-- mimetypes autorisés (une migration ultérieure destinée à un autre usage a
-- écrasé allowed_mime_types avec une liste images/vidéos uniquement), alors
-- que la CNI et l'autorisation parentale sont toujours soumises en PDF par le
-- formulaire d'inscription Miss. Résultat : l'upload de la CNI échouait
-- systématiquement (415) et l'inscription ne pouvait jamais être finalisée.
UPDATE storage.buckets
SET allowed_mime_types = array_append(allowed_mime_types, 'application/pdf')
WHERE id = 'miss-registration-files'
  AND NOT ('application/pdf' = ANY(allowed_mime_types));
