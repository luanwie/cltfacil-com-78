import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import DecimoTerceiroCalculator from "@/components/calculators/DecimoTerceiroCalculator";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import ProUpsell from "@/components/ProUpsell";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";

const DecimoTerceiro = () => {
  const { isPro, remaining, loading } = useProAndUsage();

  const faqItems = [
    {
      question: "Como é calculado o 13º salário proporcional?",
      answer:
        "O 13º proporcional é calculado com base nos meses trabalhados no ano: (salário + média de variáveis) × (meses ÷ 12).",
    },
    {
      question: "O que são as variáveis salariais no cálculo do 13º?",
      answer:
        "Comissões, horas extras, adicionais e outras parcelas habituais. Para o 13º, usa-se a média anual.",
    },
    {
      question: "Como funciona a regra dos 15 dias?",
      answer:
        "Se trabalhou ao menos 15 dias no mês, conta como mês completo para o cálculo do 13º.",
    },
    {
      question: "Quando é pago o 13º salário?",
      answer:
        "Em duas parcelas: até 30/11 e até 20/12 (com descontos de INSS/IRRF na 2ª parcela, se aplicável).",
    },
    {
      question: "Quem tem direito?",
      answer:
        "Todo trabalhador com carteira assinada que trabalhou ao menos 15 dias em um mês no ano.",
    },
  ];

  useSEO({
    title: "13º Proporcional | CLT Fácil",
    description:
      "Calcule 13º salário proporcional aos meses trabalhados. Ferramenta com divisão automática em parcelas e explicações.",
    keywords: "13º proporcional, décimo terceiro, CLT, calculadora",
    canonical: "/clt/13o-proporcional",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de 13º Proporcional",
        "Calcule o 13º salário proporcional aos meses trabalhados no ano",
        "/clt/13o-proporcional"
      ),
      ...generateFAQSchema(faqItems),
    },
  });

  const canUse = !!isPro || (typeof remaining === "number" && remaining > 0);

  return (
    <Container className="py-8 space-y-8">
      <PageHeader
        title="Calculadora de 13º Proporcional"
        description="Calcule o valor do 13º salário proporcional aos meses trabalhados no ano, considerando a regra dos 15 dias."
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Card com contador global/CTA PRO (suma se já for PRO) */}
        <ProUpsell />

        {loading ? (
          <div className="rounded-2xl border p-6 bg-card shadow-sm">
            <div className="h-5 w-40 bg-muted rounded mb-3" />
            <div className="h-4 w-64 bg-muted rounded" />
          </div>
        ) : canUse ? (
          <DecimoTerceiroCalculator />
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

        <Notice>
          <strong>Aviso Legal:</strong> Esta calculadora é uma ferramenta auxiliar baseada na legislação
          trabalhista brasileira. Para situações específicas, consulte um profissional.
        </Notice>

        <FAQ items={faqItems} />
      </div>
    </Container>
  );
};

export default DecimoTerceiro;
