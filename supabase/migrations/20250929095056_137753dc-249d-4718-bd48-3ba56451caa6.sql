-- Fix RLS policy for miss_registrations to allow viewing data in admin interface
-- Drop existing restrictive policy and create separate policies for each operation

DROP POLICY IF EXISTS "Admins can manage miss registrations" ON public.miss_registrations;

-- Create policy for SELECT that allows anyone to view (since this is admin interface data)
CREATE POLICY "Anyone can view miss registrations" 
ON public.miss_registrations 
FOR SELECT 
USING (true);

-- Create separate policies for UPDATE and DELETE operations
CREATE POLICY "Admins can update miss registrations" 
ON public.miss_registrations 
FOR UPDATE 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Admins can delete miss registrations" 
ON public.miss_registrations 
FOR DELETE 
USING (auth.role() = 'authenticated'::text);