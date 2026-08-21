-- Allow public read access to talent submissions so the admin UI (without Supabase auth) can display data
-- SECURITY NOTE: This exposes talent submissions for read to unauthenticated clients.
-- We can tighten this later once Supabase Auth is implemented for admins.

-- Create SELECT policy for everyone
CREATE POLICY "Anyone can view talent submissions"
ON public.talent_submissions
FOR SELECT
USING (true);

-- Ensure realtime works reliably for updates/inserts
ALTER TABLE public.talent_submissions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.talent_submissions;