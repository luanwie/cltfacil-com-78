import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import HorasExtrasCalculator from "@/components/calculators/HorasExtrasCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import ProUpsell from "@/components/ProUpsell";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

const HorasExtras = () => {
  const { isPro, remaining, loading } = useProAndUsage();

  const faqItems = [
    {
      question: "Quando as horas extras são 50% e quando são 100%?",
      answer:
        "50% são as horas extras normais (até 2h por dia). 100% aplicam-se em domingos, feriados ou quando há acordo específico na empresa.",
    },
    {
      question: "Qual é o limite de horas extras por mês?",
      answer:
        "O limite legal é de 2 horas extras por dia, totalizando cerca de 44 horas por mês (22 dias úteis). Alguns acordos podem alterar isso.",
    },
    {
      question: "As horas extras geram DSR?",
      answer:
        "Sim, horas extras habituais geram reflexo no Descanso Semanal Remunerado. Use nossa calculadora específica de DSR para esse cálculo.",
    },
  ];

  useSEO({
    title: "Horas Extras (50%/100%) | CLT Fácil",
    description:
      "Calcule horas extras com adicional de 50% e 100%. Ferramenta precisa para cálculos de horas suplementares.",
    keywords: "horas extras, adicional 50%, adicional 100%, hora suplementar, CLT",
    canonical: "/clt/horas-extras",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de Horas Extras",
        "Calcule horas extras com adicional de 50% e 100%",
        "/clt/horas-extras"
      ),
      ...generateFAQSchema(faqItems),
    },
  });

  const canUse = !!isPro || (typeof remaining === "number" && remaining > 0);

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora de Horas Extras (50%/100%)"
            description="Calcule o valor das horas extras com adicional de 50% e 100% sobre o valor da hora normal."
          />

          {/* Upsell padrão com contador global */}
          <ProUpsell />

          {/* Gate: se sem PRO e sem créditos, bloqueia com CTA */}
          {loading ? (
            <div className="rounded-2xl border p-6 bg-card shadow-sm">
              <div className="h-5 w-40 bg-muted rounded mb-3" />
              <div className="h-4 w-64 bg-muted rounded" />
            </div>
          ) : canUse ? (
            <HorasExtrasCalculator />
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
            Valores não incluem reflexos no DSR. Para cálculo completo com DSR sobre horas extras,
            use nossa calculadora específica.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default HorasExtras;
