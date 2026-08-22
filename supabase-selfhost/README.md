# Supabase self-hosted — Douala Fiesta

Stack officiel [`supabase/supabase`](https://github.com/supabase/supabase) (`docker/`), copié tel quel et adapté pour tourner derrière Traefik sur la même infra que le reste de cimania (réseau externe `proxy`, comme dans `Saniya/docker-compose.yml`).

- `docker-compose.yml` — le stack, avec les labels Traefik ajoutés sur `api-gw` (le service qui expose l'API REST/Auth/Storage/Realtime **et** Studio, tous derrière un seul point d'entrée sur le port 8000).
- `docker-compose.upstream.yml` — copie intacte du fichier officiel, gardée pour diff lors des mises à jour futures.
- `.env` — **secrets déjà générés** (via `utils/generate-keys.sh`) + URLs pré-remplies. **Ne jamais commiter ce fichier ni le partager.**
- `.env.example` — même chose sans les secrets, pour référence.
- `volumes/` — configs internes officielles (Envoy, scripts d'init Postgres, etc.) — ne pas modifier sauf besoin précis.

## 1. Avant de démarrer

1. Pointer un enregistrement DNS `A`/`AAAA` de `supabase.festivaldoualafiesta.cm` vers l'IP du serveur (ajuster le nom dans `.env` → `SUPABASE_PUBLIC_HOSTNAME` si besoin).
2. Vérifier que le réseau Docker externe `proxy` existe déjà sur le serveur (`docker network ls`) — c'est celui utilisé par Traefik pour Saniya. Sinon : `docker network create proxy`.
3. Relire `.env` — tout est pré-rempli et fonctionnel, mais pense à changer `DASHBOARD_USERNAME`/`DASHBOARD_PASSWORD` si tu veux un accès Studio personnalisé.

## 2. Démarrer le stack

```bash
docker compose up -d
docker compose ps
```

Studio (dashboard) et l'API sont sur `https://supabase.festivaldoualafiesta.cm` (Studio protégé par l'auth basique `DASHBOARD_USERNAME`/`DASHBOARD_PASSWORD`).

## 3. Migrer les données depuis le projet Supabase cloud actuel

⚠️ Un simple `pg_dump` global **ne suffit pas** : il rate les buckets Storage (schéma `storage`, géré par Supabase, pas `public`) et ne contient jamais les fichiers binaires. Il faut faire les 3 étapes ci-dessous, dans l'ordre, sans en sauter aucune.

**a) Schéma — rejouer les migrations du projet** plutôt qu'un dump brut, pour recréer tables, policies RLS, fonctions RPC **et** les buckets Storage (leurs `INSERT INTO storage.buckets` sont dedans) exactement comme construits à l'origine :

```bash
export PGPASSWORD=$(grep '^POSTGRES_PASSWORD=' .env | cut -d= -f2)
for f in ../supabase/migrations/*.sql; do
  echo "→ $f"
  psql "postgresql://postgres@127.0.0.1:5432/postgres" -f "$f" || break
done
```

**b) Données — dump *uniquement les données*** du schéma `public` sur le projet cloud actuel (le schéma vient d'être recréé à l'étape a, pas besoin de le redupliquer) :

```bash
pg_dump "postgresql://postgres:<mdp-cloud>@<host-cloud>.supabase.co:5432/postgres" \
  --schema=public --data-only --no-owner -f data.sql

psql "postgresql://postgres@127.0.0.1:5432/postgres" -f data.sql
```

**c) Fichiers Storage** (5 buckets : `miss-registration-files`, `kwatt-heroes`, `miss-gallery`, `program-events`, `partner-logos`) — les fichiers eux-mêmes, jamais présents dans un dump SQL :

```bash
supabase login
supabase storage cp --recursive ss:///miss-gallery ./local-export/miss-gallery --experimental
# répéter pour chaque bucket, puis réinjecter sur la nouvelle instance :
supabase storage cp --recursive ./local-export/miss-gallery ss:///miss-gallery --experimental
```

**Timing** : si le site reste en ligne pendant la migration, tout ce qui arrive après le dump (votes, inscriptions) sera manquant. Prévoir une courte fenêtre de maintenance, ou refaire un dump final juste avant de basculer l'app (étape 5).

## 4. Vérifier que rien n'a été perdu

```sql
-- Sur l'ancienne base (cloud) ET la nouvelle (locale), comparer les comptes :
select count(*) from miss_candidates;
select count(*) from miss_votes;
select count(*) from gallery_images;
select count(*) from program_events;
select count(*) from admin_users;
```

Puis manuellement : ouvrir une photo de candidate depuis la nouvelle URL Storage, se connecter à `/admin` avec un compte existant, voter une fois pour confirmer que `increment_candidate_votes` fonctionne.

## 5. Pointer l'app vers la nouvelle instance

Dans `../src/integrations/supabase/client.ts`, remplacer :

```ts
const SUPABASE_URL = "https://mpjnfyppuaurbffhtocw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJ...";
```

par l'URL et la clé `ANON_KEY` de ce `.env` (`SUPABASE_PUBLIC_URL` et `ANON_KEY`), puis reconstruire l'image de l'app (`docker compose build` dans le dossier parent).

## ⚠️ À corriger avant la mise en production

Rappel de l'audit initial — le self-host recopie le même schéma, donc les mêmes failles :
- Mot de passe admin en clair dans une migration (`AdminFiest@`) — à changer.
- Plusieurs policies RLS grandes ouvertes (`USING (true)`) sur des tables admin.
