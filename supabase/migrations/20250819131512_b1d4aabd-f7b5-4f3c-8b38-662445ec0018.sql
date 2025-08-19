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

-- Create RLS policies for new columns
-- Policy to prevent direct updates to is_pro from client
CREATE POLICY "block_is_pro_updates_from_client" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    -- Allow all updates except is_pro changes from client
    (OLD.is_pro IS NOT DISTINCT FROM NEW.is_pro AND OLD.pro_since IS NOT DISTINCT FROM NEW.pro_since)
    OR 
    -- Allow service role to update everything (edge functions)
    auth.role() = 'service_role'
  );