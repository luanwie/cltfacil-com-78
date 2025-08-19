import { supabase } from "@/integrations/supabase/client";

export async function goPro(navigate: (path: string) => void, isLogged: boolean, currentPath: string) {
  if (!isLogged) {
    navigate(`/login?next=${encodeURIComponent(currentPath)}`);
    return;
  }

  try {
    const { data, error } = await supabase.functions.invoke('checkout');
    if (error) throw error;
    
    if (data?.url) {
      window.open(data.url, '_blank');
    } else {
      navigate('/assinar-pro');
    }
  } catch (error) {
    console.error('Error creating checkout:', error);
    navigate('/assinar-pro');
  }
}