import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import BancoDeHorasCalculator from "@/components/calculators/BancoDeHorasCalculator";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";
import ProUpsell from "@/components/ProUpsell";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import { MiniChatPrompt } from "@/components/IA/MiniChatPrompt";

const BancoDeHoras = () => {
  const faqItems = [
    { question: "O que é banco de horas?", answer: "Sistema que permite compensar horas extras com folgas posteriores, conforme acordo. Sem acordo, horas extras devem ser pagas." },
    { question: "Qual é o prazo para compensar?", answer: "Práticas comuns: até 30 dias (compensação mensal), 6 meses (acordo individual escrito) ou 12 meses (acordo/conv. coletiva). Verifique sua CCT." },
    { question: "Como é calculado o saldo?", answer: "Saldo = (Horas trabalhadas − Jornada contratual) − Horas já compensadas. Positivo = crédito; negativo = débito." },
    { question: "Posso digitar hh:mm?", answer: "Sim. A ferramenta aceita tanto decimal (10.5) quanto hh:mm (10:30)." },
    { question: "E se o prazo expirar?", answer: "Horas não compensadas tendem a ser pagas como extras com adicional (ex.: 50% ou 100%), conforme legislação/negociação aplicável." },
  ];

  useSEO({
    title: "Calculadora de Banco de Horas CLT 2025 - Grátis | CLTFácil",
    description: "Calcule banco de horas conforme CLT 2025. Ferramenta gratuita para PMEs com cálculos exatos, exportação PDF e histórico. Saldo, prazos e compensação.",
    keywords: "calculadora banco de horas, CLT 2025, pequenas empresas, compensação, prazo, hora extra, adicional, saldo horas",
    canonical: "/clt/banco-de-horas",
    jsonLd: {
      ...generateCalculatorSchema("Calculadora de Banco de Horas", "Calcule saldo e prazos do banco de horas", "/clt/banco-de-horas"),
      ...generateFAQSchema(faqItems),
    },
  });

  return (
    <Container className="py-8 space-y-8">
      <PageHeader
        title="Calculadora de Banco de Horas CLT 2025"
        description="Controle o saldo do banco de horas conforme CLT 2025. Visualize prazos de compensação e estimativa de pagamento ao expirar. Ferramenta completa para PMEs."
      />

      <div className="bg-card rounded-lg p-6 border mb-6">
        <h2 className="text-xl font-semibold mb-4">Como Funciona o Banco de Horas CLT 2025</h2>
        <p className="text-muted-foreground">
          Nossa calculadora de banco de horas CLT 2025 permite controlar o saldo de horas extras e compensações. 
          Aceita formato decimal (10.5h) ou hh:mm (10:30). Calcula prazos de compensação conforme acordo coletivo 
          e estima valores de pagamento caso expire o prazo. Ideal para pequenas e médias empresas.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <ProUpsell />
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <BancoDeHorasCalculator />
          </div>

          <div className="space-y-6">
            {/* Mini Chat IA */}
            <MiniChatPrompt 
              calculatorName="Banco de Horas"
              calculatorContext="Esta calculadora permite controlar o saldo do banco de horas, calcular prazos de compensação e estimar pagamentos. Use a IA para esclarecer dúvidas sobre acordos coletivos, prazos de compensação ou situações específicas do banco de horas."
            />
          </div>
        </div>

        <Notice>
          <strong>Aviso legal:</strong> Resultados são estimativas. Regras específicas podem constar em acordo/convênio coletivo. Consulte o RH.
        </Notice>

        <FAQ items={faqItems} />
      </div>
    </Container>
  );
};

export default BancoDeHoras;
