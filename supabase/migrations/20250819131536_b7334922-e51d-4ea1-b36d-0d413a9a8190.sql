-- Add PRO subscription columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS calc_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pro_since TIMESTAMPTZ DEFAULT NULL;

-- Create RPC function to increment calculation count
CREATE OR REPLACE FUNCTION public.increment_calc_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.profiles 
  SET calc_count = calc_count + 1 
  WHERE user_id = auth.uid()
  RETURNING calc_count INTO new_count;
  
  RETURN COALESCE(new_count, 0);
END;
$$;