import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const FREE_LIMIT = 4;

export const useProAndUsage = () => {
  const { user, session, userProfile } = useAuth();
  const [calcCount, setCalcCount] = useState<number>(0);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && userProfile) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user, userProfile]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('calc_count, is_pro')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setCalcCount(data?.calc_count || 0);
      setIsPro(data?.is_pro || false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const incrementCount = async () => {
    if (!isPro) {
      const { error } = await supabase.rpc('increment_calc_count');
      if (!error) {
        setCalcCount(prev => prev + 1);
      }
    }
  };

  const isLogged = !!session;
  const remaining = Math.max(0, FREE_LIMIT - calcCount);
  const canUse = isPro || calcCount < FREE_LIMIT;
  const requireLogin = !isLogged;

  return {
    isLogged,
    isPro,
    calcCount,
    remaining,
    canUse,
    requireLogin,
    loading,
    incrementCount,
    refreshProfile: fetchProfile
  };
};