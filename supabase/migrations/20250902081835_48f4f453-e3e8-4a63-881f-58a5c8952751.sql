-- No-op: this file was a byte-for-byte duplicate of
-- 20250902080857_26c55b13-e881-44ec-b174-1f37053cdf2c.sql (same
-- CREATE TABLE admin_users/site_settings, policies, triggers, seed
-- INSERTs), minus that file's ticket_types trigger. On the original
-- dashboard-managed project this ran without visible issue (the exact
-- history of how is unclear), but replaying it verbatim on a fresh
-- project via `supabase db push` fails immediately on
-- "relation admin_users already exists". Left as a placeholder (rather
-- than deleted) to preserve migration history/ordering.
select 1;
