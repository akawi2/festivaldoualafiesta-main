-- Supprimer la contrainte d'unicité qui empêche les votes multiples
ALTER TABLE public.miss_votes DROP CONSTRAINT IF EXISTS miss_votes_candidate_id_voter_ip_voter_fingerprint_key;

-- Créer une contrainte plus souple : un seul vote par candidat par session (session_id unique)
-- Cette contrainte permet de voter pour plusieurs candidates mais pas deux fois pour la même
CREATE UNIQUE INDEX IF NOT EXISTS miss_votes_candidate_session_key 
ON public.miss_votes (candidate_id, session_id);