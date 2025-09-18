import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import AvisoPrevioCalculator from "@/components/calculators/AvisoPrevioCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";
import ProUpsell from "@/components/ProUpsell";
import { MiniChatPrompt } from "@/components/IA/MiniChatPrompt";

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
    title: "Calculadora de Aviso Prévio CLT 2025 - Grátis | CLTFácil",
    description: "Calcule aviso prévio conforme CLT 2025. Ferramenta gratuita para PMEs com cálculos exatos, exportação PDF e histórico. Dias, data projetada e indenização.",
    keywords: "calculadora aviso prévio, CLT 2025, pequenas empresas, indenização, dias aviso, 12.506/2011, progressivo",
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
            title="Calculadora de Aviso Prévio CLT 2025"
            description="Calcule dias, data projetada e indenização do aviso prévio conforme CLT 2025. Ferramenta completa para PMEs com todos os tipos de desligamento."
          />

          <div className="bg-card rounded-lg p-6 border mb-6">
            <h2 className="text-xl font-semibold mb-4">Calculadora de Aviso Prévio Progressivo CLT 2025</h2>
            <p className="text-muted-foreground">
              Nossa calculadora de aviso prévio CLT 2025 aplica a Lei 12.506/2011 com progressão automática: 
              30 dias base + 3 dias por ano trabalhado (máximo 90 dias). Suporte para dispensa, pedido, 
              acordo 484-A e justa causa. Ideal para pequenas e médias empresas.
            </p>
          </div>

          <div className="mb-6">
            <ProUpsell />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AvisoPrevioCalculator />
            </div>

            <div className="space-y-6">
              <MiniChatPrompt 
                calculatorName="Aviso Prévio"
                calculatorContext="Esta calculadora permite calcular aviso prévio proporcional (30 dias + 3 dias por ano) indenizado ou trabalhado. Use a IA para esclarecer dúvidas sobre aviso prévio ou situações específicas."
              />
            </div>
          </div>

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
