import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import AvisoPrevioCalculator from "@/components/calculators/AvisoPrevioCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";
import ProUpsell from "@/components/ProUpsell";

const AvisoPrevio = () => {
  const faqItems = [
    {
      question: "Como funciona a progressão do aviso prévio?",
      answer: "Inicia com 30 dias e acrescenta 3 dias por ano trabalhado a partir do segundo, limitado a 90 dias (Lei 12.506/2011).",
    },
    {
      question: "Qual a diferença entre aviso trabalhado e indenizado?",
      answer: "Trabalhado: o período é cumprido, com redução de 2h por dia ou 7 dias corridos (art. 488). Indenizado: paga-se o valor correspondente sem trabalhar.",
    },
    {
      question: "Como funciona no acordo (art. 484-A) e na justa causa?",
      answer: "No acordo, os dias e a indenização são reduzidos pela metade. Na justa causa, não há aviso prévio.",
    },
  ];

  useSEO({
    title: "Aviso Prévio | CLT Fácil",
    description: "Calcule dias, data projetada e indenização do aviso prévio (dispensa, pedido, acordo 484-A, justa causa).",
    keywords: "aviso prévio, indenização, dias aviso, 12.506/2011, CLT",
    canonical: "/clt/aviso-previo",
    jsonLd: {
      ...generateCalculatorSchema("Calculadora de Aviso Prévio", "Calcule dias, data projetada e indenização do aviso prévio", "/clt/aviso-previo"),
      ...generateFAQSchema(faqItems),
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora de Aviso Prévio"
            description="Calcule dias, data projetada e indenização conforme tempo de serviço e modalidade de desligamento."
          />

          <div className="mb-6">
            <ProUpsell />
          </div>

          <AvisoPrevioCalculator />

          <Notice variant="info">
            Cálculo baseado na Lei 12.506/2011 e regras da CLT (arts. 487–488 e 484-A). Situações específicas ou normas coletivas podem alterar o resultado.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default AvisoPrevio;
