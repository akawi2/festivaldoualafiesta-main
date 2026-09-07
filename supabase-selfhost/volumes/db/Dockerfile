# Bakes the init SQL scripts into the image at build time instead of
# bind-mounting each one individually at runtime — some hosts fail to
# bind-mount a single file with "not a directory" even when the source
# clearly exists (see docker-compose.yml db service). The PGDATA directory
# itself stays a real bind mount (./volumes/db/data), only these static,
# never-edited-at-runtime init scripts get baked in.
FROM supabase/postgres:17.6.1.136

COPY realtime.sql /docker-entrypoint-initdb.d/migrations/99-realtime.sql
COPY webhooks.sql /docker-entrypoint-initdb.d/init-scripts/98-webhooks.sql
COPY roles.sql /docker-entrypoint-initdb.d/init-scripts/99-roles.sql
COPY jwt.sql /docker-entrypoint-initdb.d/init-scripts/99-jwt.sql
COPY _supabase.sql /docker-entrypoint-initdb.d/migrations/97-_supabase.sql
COPY logs.sql /docker-entrypoint-initdb.d/migrations/99-logs.sql
COPY pooler.sql /docker-entrypoint-initdb.d/migrations/99-pooler.sql
