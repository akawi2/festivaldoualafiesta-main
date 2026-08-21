-- 1) Nettoyage : supprimer les anciennes contraintes/index
DROP INDEX IF EXISTS public.miss_votes_candidate_session_key;
ALTER TABLE public.miss_votes DROP CONSTRAINT IF EXISTS miss_votes_candidate_id_voter_ip_voter_fingerprint_key;

-- 2) Ajouter une colonne vote_day pour stocker le jour du vote
ALTER TABLE public.miss_votes
  ADD COLUMN IF NOT EXISTS vote_day date;

-- 3) Renseigner vote_day pour tous les enregistrements existants
UPDATE public.miss_votes
SET vote_day = (timezone('UTC', created_at))::date
WHERE vote_day IS NULL;

-- 4) Rendre la colonne obligatoire avec une valeur par défaut
ALTER TABLE public.miss_votes
  ALTER COLUMN vote_day SET NOT NULL,
  ALTER COLUMN vote_day SET DEFAULT (timezone('UTC', now()))::date;

-- 5) Supprimer les doublons : garder seulement le premier vote par jour/candidat/votant
DELETE FROM public.miss_votes a
USING public.miss_votes b
WHERE a.id > b.id
  AND a.candidate_id = b.candidate_id
  AND COALESCE(a.voter_fingerprint, a.session_id, a.voter_ip) = COALESCE(b.voter_fingerprint, b.session_id, b.voter_ip)
  AND a.vote_day = b.vote_day;

-- 6) Créer l'index unique : un seul vote par candidat/votant/jour
CREATE UNIQUE INDEX miss_votes_candidate_daily_unique
ON public.miss_votes (
  candidate_id,
  COALESCE(voter_fingerprint, session_id, voter_ip),
  vote_day
);