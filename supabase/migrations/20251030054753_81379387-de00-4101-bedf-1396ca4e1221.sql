-- Create emails table for newsletter subscriptions
CREATE TABLE public.emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email)
);

-- Enable Row Level Security
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (anyone can subscribe)
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.emails
FOR INSERT
WITH CHECK (true);

-- Only admins can view emails
CREATE POLICY "Admins can view all emails"
ON public.emails
FOR SELECT
USING (auth.role() = 'authenticated');

-- Create index on email for faster lookups
CREATE INDEX idx_emails_email ON public.emails(email);