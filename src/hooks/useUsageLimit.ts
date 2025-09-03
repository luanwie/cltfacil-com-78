import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// espelha as colunas reais da tabela 'profiles'
type ProfileRow = {
  id: string;
  is_pro: boolean | null;
  calc_count: number | null;
};

const FREE_CAP = 2;

export function useUsageLimit() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      console.log("🔍 Buscando profile para user:", user.id);
      
      // CORREÇÃO: usar user_id ao invés de id
      const { data, error } = await supabase
        .from("profiles")
        .select("is_pro, calc_count")
        .eq("user_id", user.id)
        .maybeSingle();

      console.log("📊 Profile data:", data, "Error:", error);

      if (!mounted) return;

      if (error) {
        console.warn("load profile error", error);
        setLoading(false);
        return;
      }

      const row = (data || {}) as Partial<ProfileRow>;

      console.log("✅ Definindo estado - isPro:", Boolean(row.is_pro), "count:", Number(row.calc_count ?? 0));
      
      setIsPro(Boolean(row.is_pro));
      setCount(Number(row.calc_count ?? 0));
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  // null = ilimitado (PRO)
  const remaining: number | null = useMemo(() => {
    if (isPro) return null;
    return Math.max(0, FREE_CAP - count);
  }, [isPro, count]);

  async function incrementCount() {
    if (!user) return;

    console.log("🔢 Incrementando count de", count, "para", count + 1);

    // CORREÇÃO: Usar a função RPC do Supabase ao invés de update manual
    const { data: newCount, error } = await supabase.rpc('increment_calc_count');

    if (error) {
      console.error("❌ Erro ao incrementar:", error);
      toast.error("Erro ao atualizar contador");
      return;
    }

    console.log("✅ Novo count retornado:", newCount);
    
    // Atualizar o estado local com o valor retornado
    if (typeof newCount === 'number') {
      setCount(newCount);
    }
  }

  /** Chame antes de executar o cálculo */
  async function allowOrRedirect(): Promise<boolean> {
    if (isPro) return true;
    if ((remaining ?? 0) <= 0) {
      toast.warning("Você atingiu o limite gratuito. Torne-se PRO para cálculos ilimitados.");
      navigate("/assinar-pro");
      return false;
    }
    return true;
  }

  return {
    loading,
    isPro,
    count,
    remaining,      // null => ilimitado; número => restantes
    FREE_CAP,
    allowOrRedirect,
    incrementCount,
  };
}
