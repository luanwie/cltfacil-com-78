-- Ensure the increment_calc_count RPC function exists
CREATE OR REPLACE FUNCTION public.increment_calc_count()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.profiles 
  SET calc_count = calc_count + 1 
  WHERE user_id = auth.uid()
  RETURNING calc_count INTO new_count;
  
  RETURN COALESCE(new_count, 0);
END;
$function$;