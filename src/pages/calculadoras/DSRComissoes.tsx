import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import DSRComissoesCalculator from "@/components/calculators/DSRComissoesCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import ProUpsell from "@/components/ProUpsell";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

const DSRComissoes = () => {
  const { isPro, remaining, loading } = useProAndUsage();

  const faqItems = [
    {
      question: "O que é DSR sobre comissões?",
      answer:
        "DSR é o Descanso Semanal Remunerado. Comissões e vendas variáveis também geram direito ao DSR proporcional aos dias de descanso.",
    },
    {
      question: "Como calcular o DSR sobre comissões?",
      answer:
        "Divide-se o total de comissões pelos dias trabalhados, multiplicando o resultado pelos dias de descanso no período.",
    },
    {
      question: "DSR incide sobre todas as comissões?",
      answer:
        "Sim, DSR incide sobre comissões, prêmios e outras verbas variáveis recebidas habitualmente.",
    },
  ];

  useSEO({
    title: "DSR sobre Comissões | CLT Fácil",
    description:
      "Calcule o DSR sobre comissões e vendas variáveis. Ferramenta precisa para cálculo do Descanso Semanal Remunerado.",
    keywords: "DSR comissões, descanso semanal remunerado, vendas variáveis, CLT",
    canonical: "/clt/dsr-comissoes",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de DSR sobre Comissões",
        "Calcule o DSR sobre comissões e vendas variáveis",
        "/clt/dsr-comissoes"
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
            title="Calculadora de DSR sobre Comissões"
            description="Calcule o Descanso Semanal Remunerado proporcional sobre comissões e vendas variáveis."
          />

          {/* Card com contador global/CTA PRO */}
          <ProUpsell />

          {/* Gate de acesso */}
          {loading ? (
            <div className="rounded-2xl border p-6 bg-card shadow-sm">
              <div className="h-5 w-40 bg-muted rounded mb-3" />
              <div className="h-4 w-64 bg-muted rounded" />
            </div>
          ) : canUse ? (
            <DSRComissoesCalculator />
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
            DSR incide sobre todas as verbas variáveis habituais. Considere acordos
            coletivos que podem alterar a forma de cálculo.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default DSRComissoes;
