import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import HorasExtrasCalculator from "@/components/calculators/HorasExtrasCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";
import ProUpsell from "@/components/ProUpsell";

const HorasExtras = () => {
  const faqItems = [
    {
      question: "Quando as horas extras são 50% e quando são 100%?",
      answer:
        "50% são as horas extras normais (até 2h/dia). 100% aplicam-se em domingos/feriados ou conforme acordo coletivo. Você pode personalizar os adicionais na calculadora.",
    },
    {
      question: "Qual é o limite legal de horas extras?",
      answer:
        "Em regra, 2 horas extras por dia. Verifique sua convenção coletiva para eventuais regras específicas.",
    },
    {
      question: "As horas extras geram DSR?",
      answer:
        "Sim, quando habituais. A calculadora permite estimar o DSR informando dias trabalhados e dias de descanso do período.",
    },
  ];

  useSEO({
    title: "Horas Extras (personalizável) | CLT Fácil",
    description:
      "Calcule horas extras com adicionais personalizáveis (50%, 60%, 70%, 100%), valor-hora, total por grupo e DSR opcional.",
    keywords: "horas extras, 50%, 100%, adicional, DSR, cálculo trabalhista",
    canonical: "/clt/horas-extras",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de Horas Extras (Completa)",
        "Calcule horas extras com adicionais customizáveis e DSR opcional",
        "/clt/horas-extras"
      ),
      ...generateFAQSchema(faqItems),
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora de Horas Extras"
            description="Adicionais personalizáveis, valor-hora, total por grupo e DSR opcional (domingos/feriados)."
          />

          {/* Upsell padrão (contador/benefícios/CTA) — some automaticamente se o usuário já for PRO */}
          <ProUpsell />

          {/* Sem gate aqui: a calculadora controla o uso internamente */}
          <HorasExtrasCalculator />

          <Notice variant="info">
            Os resultados são estimativas. Regras específicas podem variar por CCT/ACT.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default HorasExtras;
