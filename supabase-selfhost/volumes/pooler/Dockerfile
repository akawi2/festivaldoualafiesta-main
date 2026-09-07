# Bakes pooler.exs into the image at build time instead of bind-mounting it
# at runtime — some hosts fail to bind-mount a single file with "not a
# directory" even when the source clearly exists (see docker-compose.yml
# supavisor service).
FROM supabase/supavisor:2.9.5

COPY pooler.exs /etc/pooler/pooler.exs
