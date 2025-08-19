import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema } from "@/lib/seo";
import FeriasAbonoCalculator from "@/components/calculators/FeriasAbonoCalculator";
import Notice from "@/components/ui/notice";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import ProUpsell from "@/components/ProUpsell";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

const FeriasAbono = () => {
  const { isPro, remaining, loading } = useProAndUsage();

  useSEO({
    title: "Férias + Abono (1/3) | CLT Fácil",
    description:
      "Calcule férias com opção de venda de 1/3. Ferramenta para cálculo de férias e abono pecuniário.",
    canonical: "/clt/ferias-abono",
    jsonLd: generateCalculatorSchema(
      "Calculadora de Férias + Abono",
      "Calcule férias com opção de venda de 1/3",
      "/clt/ferias-abono"
    ),
  });

  const canUse = !!isPro || (typeof remaining === "number" && remaining > 0);

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <PageHeader
              title="Calculadora de Férias + Abono (1/3)"
              description="Calcule suas férias com opção de venda de até 1/3 do período."
            />

            {/* Card com contador global/CTA PRO (suma se já for PRO) */}
            <ProUpsell />

            {/* Gate de acesso */}
            {loading ? (
              <div className="rounded-2xl border p-6 bg-card shadow-sm">
                <div className="h-5 w-40 bg-muted rounded mb-3" />
                <div className="h-4 w-64 bg-muted rounded" />
              </div>
            ) : canUse ? (
              <FeriasAbonoCalculator />
            ) : (
              <div className="rounded-2xl border bg-card shadow-sm p-6 flex flex-col items-start gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Você já usou seus cálculos grátis</h3>
                <p className="text-sm text-muted-foreground">
                  Torne-se PRO para continuar usando esta calculadora e todas as outras sem limites.
                </p>
                <Button asChild className="mt-2">
                  <Link to="/assinar-pro">Assinar PRO</Link>
                </Button>
              </div>
            )}

            <Notice variant="info">
              Abono pecuniário pode ser vendido até 10 dias. Consulte acordos coletivos.
            </Notice>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default FeriasAbono;
