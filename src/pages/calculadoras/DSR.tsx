import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import DSRCalculator from "@/components/calculators/DSRCalculator";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import { MiniChatPrompt } from "@/components/IA/MiniChatPrompt";
import ProUpsell from "@/components/ProUpsell";

const DSR = () => {
    useSEO({
      title: "Calculadora DSR CLT 2025 - Grátis | CLTFácil",
      description: "Calcule DSR sobre horas extras conforme CLT 2025. Ferramenta gratuita para PMEs com cálculos exatos, exportação PDF e histórico. Modo manual ou automático.",
      keywords: "calculadora DSR, CLT 2025, pequenas empresas, descanso semanal remunerado, horas extras, Súmula 172",
      canonical: "/clt/dsr",
    type: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Calculadora DSR - Descanso Semanal Remunerado",
      description: "Calcule DSR sobre horas extras conforme a CLT",
      url: "/clt/dsr",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
    },
  });

  const faqData = [
    { question: "O que é o DSR sobre horas extras?", answer: "Valor adicional devido quando há realização de horas extras, aplicado sobre os dias de descanso." },
    { question: "Qual a fórmula?", answer: "DSR = (Valor das horas extras ÷ dias trabalhados) × dias de descanso (Súmula 172/TST)." },
    { question: "Quais dias contam como descanso?", answer: "Domingos e feriados do período. Se não há trabalho aos sábados, você pode incluí-los como descanso." },
    { question: "Faltas impactam o DSR?", answer: "Sim. Faltas injustificadas reduzem os dias trabalhados, elevando o rateio do DSR." },
    { question: "Qual adicional usar?", answer: "Comum: 50% dias úteis; 100% domingos/feriados. Verifique a CCT/ACT da categoria." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <PageHeader
            title="Calculadora DSR CLT 2025"
            description="Calcule o DSR sobre horas extras conforme CLT 2025. Apuração manual ou automática (mês/ano, domingos, feriados e sábados). Ferramenta completa para PMEs."
          />

          <div className="bg-card rounded-lg p-6 border mb-6">
            <h2 className="text-xl font-semibold mb-4">Como Calcular DSR sobre Horas Extras CLT 2025</h2>
            <p className="text-muted-foreground">
              Nossa calculadora de DSR CLT 2025 aplica a Súmula 172 do TST para calcular o descanso semanal remunerado 
              sobre horas extras. Modo manual ou automático por mês/ano, considerando domingos, feriados, sábados e faltas. 
              Ideal para pequenas e médias empresas que precisam de cálculos precisos.
            </p>
          </div>

          <ProUpsell />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DSRCalculator />
            </div>

            <div className="space-y-6">
              {/* Mini Chat IA */}
              <MiniChatPrompt 
                calculatorName="DSR"
                calculatorContext="Esta calculadora permite calcular o Descanso Semanal Remunerado sobre comissões, horas extras e outros adicionais variáveis. Use a IA para esclarecer dúvidas sobre a legislação do DSR, cálculos específicos ou situações especiais."
              />
            </div>
          </div>

          <Notice variant="info">
            Resultados são estimativas. CCT/ACT e escalas (12x36, 6x1, etc.) podem
            alterar critérios de dias trabalhados/descanso. Ajuste os parâmetros conforme o seu caso.
          </Notice>

          <FAQ title="Perguntas Frequentes sobre DSR" items={faqData} />
        </div>
      </Container>
    </div>
  );
};

export default DSR;
