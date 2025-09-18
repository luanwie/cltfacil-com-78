import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import DecimoTerceiroCalculator from "@/components/calculators/DecimoTerceiroCalculator";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";
import ProUpsell from "@/components/ProUpsell";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import { MiniChatPrompt } from "@/components/IA/MiniChatPrompt";

const DecimoTerceiro = () => {
  const faqItems = [
    {
      question: "Como é calculado o 13º salário?",
      answer: "Com base em 1/12 por mês válido (15+ dias). Fórmula: (salário + média de variáveis) × (meses/12).",
    },
    {
      question: "O que entra como variáveis?",
      answer: "Comissões, horas extras e adicionais habituais. Em geral, usa-se a média anual. Verifique sua CCT/ACT.",
    },
    {
      question: "Quando acontece o pagamento?",
      answer: "Usualmente em duas parcelas: 1ª até 30/11 e 2ª até 20/12. INSS/IRRF incidem na 2ª parcela quando houver.",
    },
    {
      question: "Como considerar desligamento no ano?",
      answer: "Use o modo “mês a mês” e marque apenas os meses com 15+ dias trabalhados até a rescisão.",
    },
    {
      question: "Há descontos nesta calculadora?",
      answer: "Mostramos o valor bruto. Descontos dependem de regras atuais de INSS/IRRF e podem variar.",
    },
  ];

  useSEO({
    title: "Calculadora de Décimo Terceiro CLT 2025 - Grátis | CLTFácil",
    description: "Calcule 13º salário conforme CLT 2025. Ferramenta gratuita para PMEs com cálculos exatos, exportação PDF e histórico. Meses/avos, base com variáveis e parcelas.",
    keywords: "calculadora 13º salário, CLT 2025, pequenas empresas, décimo terceiro, avos, proporcional, variáveis",
    canonical: "/clt/decimo-terceiro",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de Décimo Terceiro",
        "Calcule o 13º salário com base em meses/avos e média de variáveis",
        "/clt/decimo-terceiro"
      ),
      ...generateFAQSchema(faqItems),
    },
  });

  return (
    <Container className="py-8 space-y-8">
      <PageHeader
        title="Calculadora de Décimo Terceiro CLT 2025"
        description="Apure os avos conforme CLT 2025 (mês a mês ou por total de meses), base com variáveis e valor bruto das duas parcelas. Ferramenta completa para PMEs."
      />

      <div className="bg-card rounded-lg p-6 border mb-6">
        <h2 className="text-xl font-semibold mb-4">Como Calcular o Décimo Terceiro CLT 2025</h2>
        <p className="text-muted-foreground">
          Nossa calculadora de 13º salário CLT 2025 apura automaticamente os avos (1/12 por mês válido com 15+ dias trabalhados). 
          Inclui base com média de variáveis (comissões, horas extras, adicionais) e calcula as duas parcelas. 
          Ideal para pequenas e médias empresas.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <ProUpsell />
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DecimoTerceiroCalculator />
          </div>

          <div className="space-y-6">
            {/* Mini Chat IA */}
            <MiniChatPrompt 
              calculatorName="Décimo Terceiro"
              calculatorContext="Esta calculadora permite calcular o 13º salário considerando os avos mensais, média de variáveis e as duas parcelas. Use a IA para esclarecer dúvidas sobre cálculos, prazos de pagamento ou situações específicas do décimo terceiro."
            />
          </div>
        </div>

        <Notice>
          <strong>Aviso:</strong> O resultado é uma estimativa bruta. Para descontos e situações específicas,
          consulte a política do seu RH e sua CCT/ACT.
        </Notice>

        <FAQ items={faqItems} />
      </div>
    </Container>
  );
};

export default DecimoTerceiro;
