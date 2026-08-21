-- Supprimer l'ancienne politique de lecture restrictive
DROP POLICY IF EXISTS "Admins can manage stand reservations" ON stand_reservations;

-- Créer une politique pour permettre la lecture publique des stands
CREATE POLICY "Anyone can view stand reservations"
ON stand_reservations
FOR SELECT
USING (true);

-- Créer une politique pour permettre les mises à jour publiques (temporaire, sera sécurisé plus tard avec auth)
CREATE POLICY "Anyone can update stand reservations"
ON stand_reservations
FOR UPDATE
USING (true);

-- Créer une politique pour permettre la suppression publique (temporaire, sera sécurisé plus tard avec auth)
CREATE POLICY "Anyone can delete stand reservations"
ON stand_reservations
FOR DELETE
USING (true);