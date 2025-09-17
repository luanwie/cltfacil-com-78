-- Add IA usage tracking column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN ia_usage_count INTEGER DEFAULT 0;

-- Create function to increment IA usage count
CREATE OR REPLACE FUNCTION public.increment_ia_usage()
RETURNS INTEGER AS $$
DECLARE
  user_id_val UUID;
  new_count INTEGER;
BEGIN
  -- Get the current user ID
  user_id_val := auth.uid();
  
  IF user_id_val IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Update the IA usage count
  UPDATE public.profiles 
  SET ia_usage_count = COALESCE(ia_usage_count, 0) + 1
  WHERE user_id = user_id_val;

  -- Get the new count
  SELECT ia_usage_count INTO new_count
  FROM public.profiles 
  WHERE user_id = user_id_val;

  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;