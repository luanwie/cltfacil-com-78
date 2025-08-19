import { supabase } from "@/integrations/supabase/client";

export async function incrementCalcIfNeeded(isPro: boolean): Promise<void> {
  if (isPro) return;
  
  try {
    await supabase.rpc('increment_calc_count');
  } catch (error) {
    console.error('Error incrementing calc count:', error);
  }
}