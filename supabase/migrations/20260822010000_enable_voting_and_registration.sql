-- Active le vote Miss et les inscriptions candidates (étaient désactivés).
-- La réservation de stand n'a pas d'interrupteur équivalent dans site_settings :
-- le formulaire (ContactSection.tsx) est toujours disponible, rien à activer là.

UPDATE public.site_settings
SET value = 'true',
    updated_at = now()
WHERE key IN ('voting_enabled', 'registration_enabled');
