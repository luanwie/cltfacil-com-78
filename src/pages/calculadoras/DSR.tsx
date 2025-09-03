import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import DSRCalculator from "@/components/calculators/DSRCalculator";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";
import ProUpsell from "@/components/ProUpsell";
import { useSEO } from "@/hooks/useSEO";

const DSR = () => {
  useSEO({
    title: "Calculadora DSR - Descanso Semanal Remunerado | CLT Fácil",
    description: "Calcule o DSR sobre horas extras conforme a Súmula 172/TST. Modo manual ou automático por mês/ano.",
    keywords: "DSR, descanso semanal remunerado, horas extras, CLT, calculadora trabalhista",
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
            title="Calculadora DSR - Descanso Semanal Remunerado"
            description="Calcule o DSR sobre horas extras com apuração manual ou automática (mês/ano, domingos, feriados e sábados)."
          />

          <ProUpsell />

          <DSRCalculator />

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
