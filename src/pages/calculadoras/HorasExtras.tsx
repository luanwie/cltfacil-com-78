import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import HorasExtrasCalculator from "@/components/calculators/HorasExtrasCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";


const HorasExtras = () => {
  const faqItems = [
    {
      question: "Quando as horas extras são 50% e quando são 100%?",
      answer: "50% são as horas extras normais (até 2h por dia). 100% aplicam-se em domingos, feriados ou quando há acordo específico na empresa."
    },
    {
      question: "Qual é o limite de horas extras por mês?",
      answer: "O limite legal é de 2 horas extras por dia, totalizando cerca de 44 horas por mês (22 dias úteis). Alguns acordos podem alterar isso."
    },
    {
      question: "As horas extras geram DSR?",
      answer: "Sim, horas extras habituais geram reflexo no Descanso Semanal Remunerado. Use nossa calculadora específica de DSR para esse cálculo."
    }
  ];

  useSEO({
    title: "Horas Extras (50%/100%) | CLT Fácil",
    description: "Calcule horas extras com adicional de 50% e 100%. Ferramenta precisa para cálculos de horas suplementares.",
    keywords: "horas extras, adicional 50%, adicional 100%, hora suplementar, CLT",
    canonical: "/clt/horas-extras",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de Horas Extras",
        "Calcule horas extras com adicional de 50% e 100%",
        "/clt/horas-extras"
      ),
      ...generateFAQSchema(faqItems)
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora de Horas Extras (50%/100%)"
            description="Calcule o valor das horas extras com adicional de 50% e 100% sobre o valor da hora normal."
          />
          
          <HorasExtrasCalculator />
          
          <Notice variant="info">
            Valores não incluem reflexos no DSR. Para cálculo completo com DSR sobre horas extras, use nossa calculadora específica.
          </Notice>
          
          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default HorasExtras;