import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import HorasExtrasCalculator from "@/components/calculators/HorasExtrasCalculator";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";
import { MiniChatPrompt } from "@/components/IA/MiniChatPrompt";
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
    title: "Calculadora Horas Extras CLT 2025 - Grátis | CLTFácil",
    description:
      "Calcule horas extras conforme CLT 2025. Ferramenta gratuita para PMEs com cálculos exatos, exportação PDF e histórico. Adicionais personalizáveis e DSR opcional.",
    keywords: "calculadora horas extras, CLT 2025, pequenas empresas, 50%, 100%, adicional, DSR, cálculo trabalhista",
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
            title="Calculadora Horas Extras CLT 2025"
            description="Adicionais personalizáveis conforme CLT 2025, valor-hora, total por grupo e DSR opcional (domingos/feriados). Ferramenta completa para PMEs."
          />

          <div className="bg-card rounded-lg p-6 border mb-6">
            <h2 className="text-xl font-semibold mb-4">Como Calcular Horas Extras CLT 2025</h2>
            <p className="text-muted-foreground">
              Nossa calculadora de horas extras CLT 2025 permite personalizar adicionais (50%, 60%, 70%, 100%), 
              calcular valor-hora baseado no salário, agrupar horas por adicional e incluir DSR opcional. 
              Ideal para pequenas e médias empresas que precisam de cálculos trabalhistas precisos.
            </p>
          </div>

          {/* Upsell padrão (contador/benefícios/CTA) — some automaticamente se o usuário já for PRO */}
          <ProUpsell />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <HorasExtrasCalculator />
            </div>

            <div className="space-y-6">
              {/* Mini Chat IA */}
              <MiniChatPrompt 
                calculatorName="Horas Extras"
                calculatorContext="Esta calculadora permite calcular horas extras com diferentes adicionais (50%, 60%, 70%, 100%), valor-hora baseado no salário e DSR opcional. Use a IA para esclarecer dúvidas sobre legislação trabalhista, cálculos específicos ou convenções coletivas."
              />
            </div>
          </div>

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
