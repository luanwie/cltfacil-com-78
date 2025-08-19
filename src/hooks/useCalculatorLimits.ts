import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const FREE_LIMIT = 4;

export const useCalculatorLimits = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [calcCount, setCalcCount] = useState<number>(0);
  const [canCalculate, setCanCalculate] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && userProfile) {
      fetchCalcCount();
    } else if (user) {
      // Wait for userProfile to load
      setLoading(true);
    } else {
      setLoading(false);
      setCanCalculate(false);
    }
  }, [user, userProfile]);

  const fetchCalcCount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('calc_count, is_pro')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      const currentCount = data?.calc_count || 0;
      const isPro = data?.is_pro || false;

      setCalcCount(currentCount);
      setCanCalculate(isPro || currentCount < FREE_LIMIT);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching calc count:', error);
      setLoading(false);
    }
  };

  const checkAndIncrementLimit = async (): Promise<boolean> => {
    if (!user) {
      toast.error('Você precisa estar logado para fazer cálculos');
      navigate('/login');
      return false;
    }

    if (!userProfile) {
      toast.error('Carregando perfil do usuário...');
      return false;
    }

    // Check if user is PRO
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_pro, calc_count')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      const isPro = data?.is_pro || false;
      const currentCount = data?.calc_count || 0;

      if (isPro) {
        return true; // PRO users have unlimited calculations
      }

      if (currentCount >= FREE_LIMIT) {
        toast.error('Limite gratuito atingido! Torne-se PRO para cálculos ilimitados.');
        navigate('/assinar-pro');
        return false;
      }

      // Increment calculation count
      const { error: rpcError } = await supabase.rpc('increment_calc_count');
      
      if (rpcError) {
        console.error('Error incrementing calc count:', rpcError);
        toast.error('Erro ao processar cálculo');
        return false;
      }

      // Update local state
      setCalcCount(currentCount + 1);
      setCanCalculate(currentCount + 1 < FREE_LIMIT);

      // Show warning when approaching limit
      if (currentCount + 1 === FREE_LIMIT - 1) {
        toast.warning('Você tem apenas 1 cálculo gratuito restante!');
      }

      return true;
    } catch (error) {
      console.error('Error checking calculation limits:', error);
      toast.error('Erro ao verificar limites');
      return false;
    }
  };

  const getRemainingCalculations = (): number => {
    if (!userProfile) return 0;
    const isPro = (userProfile as any)?.is_pro || false;
    if (isPro) return Infinity;
    return Math.max(0, FREE_LIMIT - calcCount);
  };

  return {
    canCalculate: !loading && canCalculate,
    calcCount,
    remainingCalculations: getRemainingCalculations(),
    loading,
    checkAndIncrementLimit,
    FREE_LIMIT,
  };
};