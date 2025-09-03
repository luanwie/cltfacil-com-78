import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Limite para usuários logados (plano gratuito)
const FREE_LIMIT = 2;

// Limite para visitantes não logados (1 cálculo grátis)
const ANON_LIMIT = 1;

// Recupera quantos cálculos o visitante anônimo já fez a partir do localStorage
function getAnonCount() {
  const raw = localStorage.getItem('anonCalcCount');
  return raw ? parseInt(raw, 10) : 0;
}

// Incrementa o contador anônimo no localStorage (mantido para compatibilidade)
function incrementAnonCount() {
  const current = getAnonCount();
  localStorage.setItem('anonCalcCount', (current + 1).toString());
}

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

  // Número de cálculos restantes considerando usuário logado ou anônimo
  const anonCount = getAnonCount();
  const anonRemaining = Math.max(0, ANON_LIMIT - anonCount);
  const remaining = isLogged
    ? Math.max(0, FREE_LIMIT - calcCount)
    : anonRemaining;

  // Pode usar se for PRO, ou se tiver cálculos restantes (logado ou anônimo)
  const canUse = isPro || (isLogged ? calcCount < FREE_LIMIT : anonCount < ANON_LIMIT);

  // Se não estiver logado e já excedeu o limite anônimo, exigir login
  const requireLogin = !isLogged && anonCount >= ANON_LIMIT;

  return {
    isLogged,
    isPro,
    calcCount,
    remaining,
    canUse,
    requireLogin,
    loading,
    incrementCount,
    refreshProfile: fetchProfile,
  };
};
