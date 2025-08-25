import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const FREE_LIMIT = 4;

export const useProAndUsage = () => {
  const { user, session } = useAuth();

  const [calcCount, setCalcCount] = useState<number>(0);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);

        if (!user || !session) {
          if (alive) {
            setIsPro(false);
            setCalcCount(0);
            setLoading(false);
          }
          return;
        }

        // 1) pega contador do perfil
        const [{ data: profileData, error: profileErr }, { data: sessData }] = await Promise.all([
          supabase.from('profiles').select('calc_count').eq('user_id', user.id).single(),
          supabase.auth.getSession()
        ]);

        if (profileErr) {
          // não bloqueia o fluxo — só loga
          console.error('Error fetching profile calc_count:', profileErr);
        }

        const token = sessData.session?.access_token;

        // 2) checa PRO em tempo real no Stripe via Edge Function
        let pro = false;
        if (token) {
          try {
            const res = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-subscription-summary`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const json = await res.json();

            if (!res.ok) {
              throw new Error(json?.error || 'Falha ao consultar assinatura');
            }

            const status: string = json?.subscription?.status ?? 'none';
            // Considera PRO quando: active / trialing / past_due
            pro = status === 'active' || status === 'trialing' || status === 'past_due';
          } catch (e) {
            console.error('Stripe verify failed:', e);
            // fallback conservador: mantém pro=false
            pro = false;
          }
        }

        if (alive) {
          setCalcCount(profileData?.calc_count ?? 0);
          setIsPro(pro);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => { alive = false; };
  }, [user, session]);

  const incrementCount = async () => {
    // só conta uso se não for PRO
    if (!isPro) {
      const { error } = await supabase.rpc('increment_calc_count');
      if (!error) setCalcCount(prev => prev + 1);
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
    // mantém a API: força recarregar (útil após compra/cancelamento)
    refreshProfile: async () => {
      // dispara novamente o efeito acima indiretamente
      // (pegando session atual e repetindo a lógica)
      const sess = await supabase.auth.getSession();
      if (!sess.data.session) {
        setIsPro(false);
        setCalcCount(0);
        return;
      }
      // reexecuta a verificação do Stripe e do calc_count
      // (mesma lógica do effect, enxuta aqui)
      try {
        const [{ data: profileData }, { data: s }] = await Promise.all([
          supabase.from('profiles').select('calc_count').eq('user_id', user?.id).single(),
          supabase.auth.getSession()
        ]);
        const token = s.session?.access_token;

        let pro = false;
        if (token) {
          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-subscription-summary`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const json = await res.json();
          if (res.ok) {
            const status: string = json?.subscription?.status ?? 'none';
            pro = status === 'active' || status === 'trialing' || status === 'past_due';
          }
        }

        setCalcCount(profileData?.calc_count ?? 0);
        setIsPro(pro);
      } catch (e) {
        console.error('refreshProfile failed:', e);
      }
    }
  };
};
