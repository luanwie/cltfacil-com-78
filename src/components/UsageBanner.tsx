import { Crown, Check, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  remaining: number;
  isPro: boolean;
  isLogged: boolean;
  onGoPro: () => void;
};

export default function UsageBanner({ remaining, isPro, isLogged, onGoPro }: Props) {
  // PRO não vê nada
  if (isPro) return null;

  const hasFree = (remaining ?? 0) > 0;

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="rounded-2xl border bg-card shadow-sm p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold">
              Desbloqueie recursos PRO
            </h3>

            {/* Linha de status padronizada (sem fundo amarelo) */}
            <p className="text-sm text-muted-foreground mt-1">
              {hasFree
                ? <>Você ainda tem <strong>{remaining} cálculo{remaining === 1 ? "" : "s"} gratuito{remaining === 1 ? "" : "s"}</strong>.</>
                : <>Você já usou seus cálculos grátis. Assine para continuar.</>}
            </p>

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

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button onClick={onGoPro} className="shadow-sm">
                {hasFree ? "Assinar PRO" : <>Assinar PRO</>}
              </Button>

              {!isLogged && (
                <span className="inline-flex items-center text-xs text-muted-foreground gap-1">
                  <LogIn className="h-3.5 w-3.5" />
                  Faça login para salvar seu histórico
                </span>
              )}

              {!hasFree && (
                <span className="inline-flex items-center text-xs text-muted-foreground gap-1">
                  <Lock className="h-3.5 w-3.5" />
                  Cálculos bloqueados até assinar
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
