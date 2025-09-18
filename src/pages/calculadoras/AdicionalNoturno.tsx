import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";
import AdicionalNoturnoCalculator from "@/components/calculators/AdicionalNoturnoCalculator";
import ProUpsell from "@/components/ProUpsell";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import { MiniChatPrompt } from "@/components/IA/MiniChatPrompt";

const AdicionalNoturno = () => {
  const faqItems = [
    {
      question: "Qual o percentual do adicional noturno?",
      answer:
        "No trabalho urbano, o adicional mínimo é de 20% (CLT, art. 73). No trabalho rural, a regra geral é 25% (com faixas horárias distintas conforme lavoura/pecuária). Convenções coletivas podem fixar percentuais diferentes.",
    },
    {
      question: "Qual o horário considerado noturno?",
      answer:
        "Urbano: das 22h às 5h. Rural: lavoura das 21h às 5h; pecuária das 20h às 4h. A jornada que começar no período noturno e se estender após o término continua recebendo adicional na prorrogação, conforme Súmula 60 do TST.",
    },
    {
      question: "A hora noturna tem duração diferente?",
      answer:
        "Somente no trabalho urbano: a hora noturna é reduzida para 52m30s (CLT, art. 73, §1º). No meio rural, a hora permanece com 60 minutos.",
    },
  ];

  useSEO({
    title: "Calculadora de Adicional Noturno CLT 2025 - Grátis | CLTFácil",
    description:
      "Calcule adicional noturno conforme CLT 2025. Ferramenta gratuita para PMEs com cálculos exatos, exportação PDF e histórico. Regras urbanas e rurais.",
    keywords:
      "calculadora adicional noturno, CLT 2025, pequenas empresas, trabalho noturno, 20% adicional, hora reduzida, lavoura pecuária",
    canonical: "/clt/adicional-noturno",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de Adicional Noturno CLT 2025",
        "Calcule adicional noturno urbano e rural conforme CLT 2025",
        "/clt/adicional-noturno"
      ),
      ...generateFAQSchema(faqItems),
    },
  });

  return (
    <>
      <section className="py-12">
        <Container size="md">
          <PageHeader
            title="Calculadora de Adicional Noturno CLT 2025"
            description="Calcule adicional noturno conforme CLT 2025. Regras urbanas (22h–5h, hora reduzida) e rurais (lavoura/pecuária), com prorrogação após período noturno."
          />

          <div className="bg-card rounded-lg p-6 border mb-6">
            <h2 className="text-xl font-semibold mb-4">Como Funciona o Adicional Noturno CLT 2025</h2>
            <p className="text-muted-foreground">
              Nossa calculadora de adicional noturno CLT 2025 considera todas as regras da legislação trabalhista. 
              Para trabalho urbano: adicional mínimo de 20% das 22h às 5h com hora reduzida (52min30s). 
              Para trabalho rural: 25% com horários específicos para lavoura e pecuária. Ferramenta ideal para PMEs.
            </p>
          </div>
        </Container>
      </section>

      <section className="pb-12">
        <Container size="md">
          <div className="max-w-4xl mx-auto mb-8">
            <ProUpsell />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AdicionalNoturnoCalculator
                showShareButtons={false}
                showAds={true}
                suppressUsageUi={true}
              />
            </div>

            <div className="space-y-6">
              {/* Mini Chat IA */}
              <MiniChatPrompt 
                calculatorName="Adicional Noturno"
                calculatorContext="Esta calculadora permite calcular o adicional noturno (20% urbano, 25% rural) conforme CLT. Use a IA para esclarecer dúvidas sobre horários noturnos, cálculos específicos ou regras da sua categoria profissional."
              />
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <Notice variant="warning">
              <strong>Atenção:</strong> Este cálculo é uma estimativa baseada na CLT e na Súmula 60 do TST. Verifique sempre a CCT/ACT da sua categoria para percentuais e regras específicas.
            </Notice>
          </div>
        </Container>
      </section>

      <section className="py-12 bg-muted/30">
        <Container size="md">
          <FAQ items={faqItems} />
        </Container>
      </section>
    </>
  );
};

export default AdicionalNoturno;