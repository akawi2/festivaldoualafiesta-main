-- Create a table for "me mettre en lumière" form submissions
CREATE TABLE public.talent_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  stage_name TEXT NOT NULL,
  phone TEXT,
  quartier TEXT,
  arrondissement TEXT,
  participation_type TEXT NOT NULL,
  talent_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.talent_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can submit talent applications" 
ON public.talent_submissions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage talent submissions" 
ON public.talent_submissions 
FOR ALL 
USING (auth.role() = 'authenticated'::text);

-- Create function to submit talent applications
CREATE OR REPLACE FUNCTION public.submit_talent_application(
  p_name TEXT,
  p_stage_name TEXT,
  p_phone TEXT,
  p_quartier TEXT,
  p_arrondissement TEXT,
  p_participation_type TEXT,
  p_talent_description TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.talent_submissions (
    name, 
    stage_name, 
    phone, 
    quartier, 
    arrondissement, 
    participation_type, 
    talent_description
  )
  VALUES (
    p_name, 
    p_stage_name, 
    p_phone, 
    p_quartier, 
    p_arrondissement, 
    p_participation_type, 
    p_talent_description
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_talent_submissions_updated_at
BEFORE UPDATE ON public.talent_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();