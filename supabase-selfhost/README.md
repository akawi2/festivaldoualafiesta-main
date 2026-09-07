# Supabase self-hosted — Douala Fiesta

Stack officiel [`supabase/supabase`](https://github.com/supabase/supabase) (`docker/`), copié tel quel et adapté pour tourner derrière Traefik sur la même infra que le reste de cimania (réseau externe `dokploy-network`, créé automatiquement par Dokploy).

- `docker-compose.yml` — le stack, avec les labels Traefik ajoutés sur `api-gw` (le service qui expose l'API REST/Auth/Storage/Realtime **et** Studio, tous derrière un seul point d'entrée sur le port 8000).
- `docker-compose.upstream.yml` — copie intacte du fichier officiel, gardée pour diff lors des mises à jour futures.
- `.env` — **secrets déjà générés** (via `utils/generate-keys.sh`) + URLs pré-remplies. **Ne jamais commiter ce fichier ni le partager.**
- `.env.example` — même chose sans les secrets, pour référence.
- `volumes/` — configs internes officielles (Envoy, scripts d'init Postgres, etc.) — ne pas modifier sauf besoin précis.

## 1. Avant de démarrer

1. Pointer un enregistrement DNS `A`/`AAAA` de `supabase.festivaldoualafiesta.cm` vers l'IP du serveur (ajuster le nom dans `.env` → `SUPABASE_PUBLIC_HOSTNAME` si besoin).
2. Vérifier que le réseau Docker externe `dokploy-network` existe déjà sur le serveur (`docker network ls`) — Dokploy le crée normalement lui-même. Sinon : `docker network create dokploy-network`.
3. Relire `.env` — tout est pré-rempli et fonctionnel, mais pense à changer `DASHBOARD_USERNAME`/`DASHBOARD_PASSWORD` si tu veux un accès Studio personnalisé.

## 2. Démarrer le stack

```bash
docker compose up -d
docker compose ps
```

Studio (dashboard) et l'API sont sur `https://supabase.festivaldoualafiesta.cm` (Studio protégé par l'auth basique `DASHBOARD_USERNAME`/`DASHBOARD_PASSWORD`).

**Le schéma applicatif (les 50+ fichiers de `../supabase/migrations/`) se rejoue automatiquement** via le service `migrations` du compose — pas besoin de le faire à la main. Il tourne une fois, applique tout dans l'ordre, marque chaque fichier dans une table `_migrations_applied` pour ne jamais le rejouer deux fois (même après un redémarrage du stack), puis s'arrête. Pour suivre sa progression ou le relancer manuellement :

```bash
docker compose logs migrations
# ou pour le relancer explicitement (idempotent, sans risque) :
docker compose run --rm migrations
```

## 3. Importer les données de test depuis le projet Supabase cloud (automatique)

Deux services one-shot enchaînent automatiquement après `migrations`, **si `CLOUD_DATABASE_URL` est renseigné dans `.env`** :

- `data-seed` — dump *data-only* du schéma `public` sur le projet cloud (`pg_dump`) puis import local (`psql`). S'exécute une seule fois : au prochain `docker compose up`, il se voit déjà fait (table `public._data_seeded`) et ne repasse pas.
- `storage-seed` — pour chaque ligne importée qui pointe encore vers une URL Storage du projet cloud (photos de candidates, galerie, CNI, logos partenaires, images de programme...), télécharge le fichier en HTTPS simple (tous les buckets sont publics, **aucune clé S3 requise**) et le ré-uploade dans le Storage de cette instance, puis réécrit l'URL en base. Lui aussi idempotent : une ligne déjà réécrite vers `SUPABASE_PUBLIC_URL` est ignorée au prochain passage.

**Pour l'activer**, renseigner dans `.env` (jamais commité) :

```bash
CLOUD_DATABASE_URL=postgresql://postgres:<mdp-cloud>@<host-cloud>.supabase.co:5432/postgres
```

puis `docker compose up -d` (ou juste relancer les deux services : `docker compose run --rm data-seed && docker compose run --rm storage-seed`). Sans cette variable, le stack démarre avec un schéma vide (comportement par défaut, aucune erreur).

⚠️ `CLOUD_DATABASE_URL` contient le mot de passe de production — ne le laisser que dans le `.env` du serveur qui en a réellement besoin, jamais dans ce dépôt. Une fois l'import confirmé (étape 4), tu peux le retirer du `.env` : il ne sert qu'au premier démarrage.

**Timing** : si le site reste en ligne pendant l'import, tout ce qui arrive après le dump (votes, inscriptions) sera manquant. Pour un environnement de test ce n'est généralement pas gênant ; pour une vraie bascule de prod, prévoir une courte fenêtre de maintenance ou relancer `data-seed` juste avant de basculer l'app (après avoir vidé `public._data_seeded`).

<details>
<summary>Import manuel (dépannage / cas particulier)</summary>

```bash
# a) Données
pg_dump "postgresql://postgres:<mdp-cloud>@<host-cloud>.supabase.co:5432/postgres" \
  --schema=public --data-only --no-owner -f data.sql
psql "postgresql://postgres@127.0.0.1:$(grep '^POSTGRES_PORT=' .env | cut -d= -f2)/postgres" -f data.sql

# b) Fichiers Storage (si storage-seed ne suffit pas, ex. accès direct hors du réseau compose)
rclone config create cloud-supabase s3 \
  provider=Other \
  endpoint=https://mpjnfyppuaurbffhtocw.supabase.co/storage/v1/s3 \
  access_key_id=<access-key-du-dashboard> \
  secret_access_key=<secret-key-du-dashboard>

rclone config create selfhosted-supabase s3 \
  provider=Other \
  endpoint=https://supabase.festivaldoualafiesta.cm/storage/v1/s3 \
  access_key_id=$(grep '^S3_PROTOCOL_ACCESS_KEY_ID=' .env | cut -d= -f2) \
  secret_access_key=$(grep '^S3_PROTOCOL_ACCESS_KEY_SECRET=' .env | cut -d= -f2)

for bucket in miss-registration-files kwatt-heroes miss-gallery program-events partner-logos; do
  rclone copy "cloud-supabase:$bucket" "selfhosted-supabase:$bucket" --progress
done
```

</details>

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

## 5. Déployer l'app avec cette instance comme backend

`client.ts` lit désormais `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` au build (voir `../.env.example`) — plus besoin d'éditer de fichier source. Dans le dossier parent (`festivaldoualafiesta-main/`) :

```bash
cp .env.example .env
# éditer .env :
#   VITE_SUPABASE_URL=https://supabase.festivaldoualafiesta.cm   (SUPABASE_PUBLIC_URL de ce .env)
#   VITE_SUPABASE_PUBLISHABLE_KEY=<ANON_KEY de ce .env>

docker compose build
docker compose up -d
```

Sans ce `.env`, le build retombe automatiquement sur le Supabase cloud de production (valeur par défaut codée dans `client.ts`) — donc aucun risque de casser autre chose en oubliant cette étape.

## ⚠️ À corriger avant la mise en production

Rappel de l'audit initial — le self-host recopie le même schéma, donc les mêmes failles :
- Mot de passe admin en clair dans une migration (`AdminFiest@`) — à changer.
- Plusieurs policies RLS grandes ouvertes (`USING (true)`) sur des tables admin.
