// src/components/ProUpsell.tsx
import { Button } from "@/components/ui/button";
import { Crown, Check, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useProAndUsage } from "@/hooks/useProAndUsage";

type ProUpsellProps = {
  className?: string;
  // overrides opcionais (para testes ou SSR)
  isProOverride?: boolean;
  remainingOverride?: number;
  loadingOverride?: boolean;
};

const ProUpsell = ({
  className,
  isProOverride,
  remainingOverride,
  loadingOverride,
}: ProUpsellProps) => {
  // Hook único do projeto que consolida PRO + uso grátis
  const { isPro, remaining, loading } = useProAndUsage();

  const effectiveIsPro = isProOverride ?? isPro ?? false;
  const effectiveRemaining = remainingOverride ?? remaining ?? 0;
  const effectiveLoading = loadingOverride ?? loading ?? false;

  // Se já é PRO, não mostra nada
  if (effectiveIsPro) return null;

  const hasFreeLeft = effectiveRemaining > 0;

  return (
    <div className={`rounded-2xl border bg-card shadow-sm p-5 md:p-6 ${className ?? ""}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Crown className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Desbloqueie recursos PRO</h3>
            {effectiveLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          {!effectiveLoading && (
            <p className={`text-sm mt-1 ${hasFreeLeft ? "text-muted-foreground" : "text-destructive"}`}>
              {hasFreeLeft
                ? `Você ainda tem ${effectiveRemaining} ${effectiveRemaining === 1 ? "cálculo grátis" : "cálculos grátis"}.`
                : "Você já usou seus cálculos grátis."}
            </p>
          )}

          <ul className="mt-4 grid gap-2 text-sm">
            <li className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Exportar cálculo em PDF (PRO)
            </li>
            <li className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Histórico ilimitado de simulações (PRO)
            </li>
            <li className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Site sem anúncios (PRO)
            </li>
          </ul>

          <div className="mt-5">
            <Button asChild className="shadow-sm">
              <Link to="/assinar-pro">Assinar PRO</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProUpsell;
