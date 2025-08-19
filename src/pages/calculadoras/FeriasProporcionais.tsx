import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";

import FeriasProporcionaisCalculator from "@/components/calculators/FeriasProporcionaisCalculator";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";

const FeriasProporcionais = () => {
  const faqItems = [
    {
      question: "Como são calculados os dias de férias proporcionais?",
      answer: "Para cada mês completo trabalhado, o empregado tem direito a 2,5 dias de férias (30 dias ÷ 12 meses). Assim, se trabalhou 6 meses, terá direito a 15 dias de férias proporcionais."
    },
    {
      question: "O que é o 1/3 constitucional?",
      answer: "É um adicional obrigatório de 1/3 (33,33%) sobre o valor das férias, garantido pela Constituição Federal de 1988. Incide tanto sobre férias integrais quanto proporcionais."
    },
    {
      question: "Quando devo arredondar os dias para cima?",
      answer: "O arredondamento pode variar conforme a convenção coletiva da categoria. Na ausência de regra específica, frações de dias são geralmente desconsideradas (arredondamento para baixo)."
    }
  ];

  useSEO({
    title: "Férias Proporcionais | CLT Fácil",
    description: "Calcule férias proporcionais ao período trabalhado. Ferramenta gratuita com 1/3 constitucional automático.",
    keywords: "férias proporcionais, 1/3 constitucional, CLT, calculadora",
    canonical: `${window.location.origin}/clt/ferias-proporcionais`,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        generateCalculatorSchema(
          "Calculadora de Férias Proporcionais",
          "Calcule férias proporcionais ao período trabalhado com 1/3 constitucional automático",
          `${window.location.origin}/clt/ferias-proporcionais`
        ),
        generateFAQSchema(faqItems)
      ]
    }
  });

  return (
    <>
      <section className="py-12">
        <Container size="md">
          <PageHeader
            title="Calculadora de Férias Proporcionais"
            description="Calcule férias proporcionais ao período trabalhado com 1/3 constitucional automático."
          />
        </Container>
      </section>

      <section className="pb-12">
        <Container size="md">
          <div className="max-w-4xl mx-auto space-y-6">
            <FeriasProporcionaisCalculator />
            
            <Notice variant="warning">
              <strong>Atenção:</strong> Este cálculo é uma estimativa baseada na CLT. 
              Consulte sempre a CCT da sua categoria para verificar regras específicas.
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