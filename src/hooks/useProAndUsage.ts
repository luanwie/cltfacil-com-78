// src/hooks/useProAndUsage.ts
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type StripeSummary = {
  subscription?: {
    status: string; // active, trialing, past_due, canceled...
    cancel_at_period_end: boolean;
  } | null;
};

export function useProAndUsage() {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) {
          if (alive) { setIsPro(false); setLoading(false); }
          return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-subscription-summary`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json: StripeSummary & { error?: string } = await res.json();
        if (!res.ok) throw new Error(json?.error || "Falha ao consultar assinatura");

        const status = json.subscription?.status ?? "none";
        // Considera PRO: active/trialing/past_due
        const pro =
          status === "active" || status === "trialing" || status === "past_due";

        if (alive) setIsPro(pro);
      } catch (e: any) {
        if (alive) {
          setError(e.message || "Erro ao carregar PRO");
          setIsPro(false);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  // Se você continuar usando limite de uso gratuito, integre aqui seu contador (calc_count) depois.
  return { isPro, loading, error /*, usage, etc. */ };
}
