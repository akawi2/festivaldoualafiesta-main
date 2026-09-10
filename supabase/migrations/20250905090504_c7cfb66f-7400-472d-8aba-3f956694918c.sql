-- No-op: this file was a byte-for-byte duplicate of
-- 20250905090338_7b1819f7-f840-4789-be90-e66245feae5b.sql (same
-- CREATE TABLE gallery_images, policies, trigger, seed INSERTs). On the
-- original dashboard-managed project this ran without visible issue (the
-- exact history of how is unclear), but replaying it verbatim on a fresh
-- project via `supabase db push` fails immediately on
-- "relation gallery_images already exists". Left as a placeholder (rather
-- than deleted) to preserve migration history/ordering.
select 1;
