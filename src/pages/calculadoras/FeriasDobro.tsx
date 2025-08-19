import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema } from "@/lib/seo";
import FeriasDobroCalculator from "@/components/calculators/FeriasDobroCalculator";
import Notice from "@/components/ui/notice";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import ProUpsell from "@/components/ProUpsell";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

const FeriasDobro = () => {
  const { isPro, remaining, loading } = useProAndUsage();

  useSEO({
    title: "Férias em Dobro | CLT Fácil",
    description:
      "Calcule férias vencidas em dobro. Ferramenta para cálculo de férias não gozadas no prazo legal.",
    canonical: "/clt/ferias-dobro",
    jsonLd: generateCalculatorSchema(
      "Calculadora de Férias em Dobro",
      "Calcule férias vencidas em dobro",
      "/clt/ferias-dobro"
    ),
  });

  const canUse = !!isPro || (typeof remaining === "number" && remaining > 0);

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora de Férias em Dobro"
            description="Calcule o valor das férias vencidas em dobro quando não gozadas no prazo legal."
          />

          {/* 🔵 Card PRO padronizado (igual ao print certo) */}
          <ProUpsell />

          {/* 🔒 Gate: libera se PRO ou ainda há grátis; senão, trava com CTA */}
          {loading ? (
            <div className="rounded-2xl border p-6 bg-card shadow-sm">
              <div className="h-5 w-40 bg-muted rounded mb-3" />
              <div className="h-4 w-64 bg-muted rounded" />
            </div>
          ) : canUse ? (
            <FeriasDobroCalculator />
          ) : (
            <div className="rounded-2xl border bg-card shadow-sm p-6 flex flex-col items-start gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Você já usou seus cálculos grátis</h3>
              <p className="text-sm text-muted-foreground">
                Torne-se PRO para continuar usando esta calculadora e todas as outras sem
                limites.
              </p>
              <Button asChild className="mt-2">
                <Link to="/assinar-pro">Assinar PRO</Link>
              </Button>
            </div>
          )}

          {/* ℹ️ Aviso no padrão azul como no print certo */}
          <Notice variant="info">
            Férias em dobro aplicam-se quando não gozadas após 12 meses do período
            aquisitivo.
          </Notice>
        </div>
      </Container>
    </div>
  );
};

export default FeriasDobro;
