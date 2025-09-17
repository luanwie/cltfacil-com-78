import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Limite para usuários gratuitos (1 pergunta por mês)
const FREE_IA_LIMIT = 1;

export const useIAUsage = () => {
  const { user, session } = useAuth();
  const [iaUsageCount, setIaUsageCount] = useState<number>(0);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('ia_usage_count, is_pro')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setIaUsageCount(data?.ia_usage_count || 0);
      setIsPro(data?.is_pro || false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const incrementIAUsage = async () => {
    if (!user || isPro) return;

    try {
      const { error } = await supabase.rpc('increment_ia_usage');
      if (!error) {
        setIaUsageCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error incrementing IA usage:', error);
    }
  };

  const isLogged = !!session;
  const remainingIA = Math.max(0, FREE_IA_LIMIT - iaUsageCount);
  const canUseIA = isPro || (isLogged && iaUsageCount < FREE_IA_LIMIT);

  return {
    isLogged,
    isPro,
    iaUsageCount,
    remainingIA,
    canUseIA,
    loading,
    incrementIAUsage,
    refreshProfile: fetchProfile,
  };
};