import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import ProUpsell from "@/components/ProUpsell";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

import FeriasProporcionaisCalculator from "@/components/calculators/FeriasProporcionaisCalculator";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";

const FeriasProporcionais = () => {
  const { isPro, remaining, loading } = useProAndUsage();

  const faqItems = [
    {
      question: "Como são calculados os dias de férias proporcionais?",
      answer:
        "Para cada mês completo trabalhado, o empregado tem direito a 2,5 dias de férias (30 dias ÷ 12 meses). Assim, se trabalhou 6 meses, terá direito a 15 dias de férias proporcionais.",
    },
    {
      question: "O que é o 1/3 constitucional?",
      answer:
        "É um adicional obrigatório de 1/3 (33,33%) sobre o valor das férias, garantido pela Constituição Federal de 1988. Incide tanto sobre férias integrais quanto proporcionais.",
    },
    {
      question: "Quando devo arredondar os dias para cima?",
      answer:
        "O arredondamento pode variar conforme a convenção coletiva da categoria. Na ausência de regra específica, frações de dias são geralmente desconsideradas (arredondamento para baixo).",
    },
  ];

  useSEO({
    title: "Férias Proporcionais | CLT Fácil",
    description:
      "Calcule férias proporcionais ao período trabalhado. Ferramenta gratuita com 1/3 constitucional automático.",
    keywords: "férias proporcionais, 1/3 constitucional, CLT, calculadora",
    canonical: "/clt/ferias-proporcionais",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        generateCalculatorSchema(
          "Calculadora de Férias Proporcionais",
          "Calcule férias proporcionais ao período trabalhado com 1/3 constitucional automático",
          "/clt/ferias-proporcionais"
        ),
        generateFAQSchema(faqItems),
      ],
    },
  });

  const canUse = !!isPro || (typeof remaining === "number" && remaining > 0);

  return (
    <>
      <section className="py-12">
        <Container size="md">
          <div className="max-w-4xl mx-auto space-y-6">
            <PageHeader
              title="Calculadora de Férias Proporcionais"
              description="Calcule férias proporcionais ao período trabalhado com 1/3 constitucional automático."
            />

            {/* Card PRO (contador/CTA) */}
            <ProUpsell />

            {/* Gate de acesso */}
            {loading ? (
              <div className="rounded-2xl border p-6 bg-card shadow-sm">
                <div className="h-5 w-40 bg-muted rounded mb-3" />
                <div className="h-4 w-64 bg-muted rounded" />
              </div>
            ) : canUse ? (
              <FeriasProporcionaisCalculator />
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

            <Notice variant="warning">
              <strong>Atenção:</strong> Este cálculo é uma estimativa baseada na CLT. Consulte
              sempre a CCT da sua categoria para verificar regras específicas.
            </Notice>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-muted/30">
        <Container size="md">
          <FAQ items={faqItems} />
        </Container>
      </section>
    </>
  );
};

export default FeriasProporcionais;
