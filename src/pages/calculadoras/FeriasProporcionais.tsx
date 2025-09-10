import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";
import ProUpsell from "@/components/ProUpsell";
import FeriasProporcionaisCalculator from "@/components/calculators/FeriasProporcionaisCalculator";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";

const FeriasProporcionais = () => {
  const faqItems = [
    {
      question: "Como são calculados os dias de férias proporcionais?",
      answer:
        "Cada mês válido conta 2,5 dias (30/12). Válido = mês com pelo menos 15 dias trabalhados.",
    },
    {
      question: "O que entra na base de férias?",
      answer:
        "Salário + médias habituais (comissões, horas extras, adicionais etc.), quando existentes.",
    },
    {
      question: "O 1/3 constitucional é obrigatório?",
      answer:
        "Sim, por regra geral. A calculadora permite simular sem 1/3 quando você precisar apenas da base das férias.",
    },
  ];

  useSEO({
    title: "Calculadora Férias Proporcionais CLT 2025 - Grátis | CLTFácil",
    description: "Calcule férias proporcionais conforme CLT 2025. Ferramenta gratuita para PMEs com cálculos exatos, exportação PDF e histórico. Por meses ou datas automáticas.",
    keywords: "calculadora férias proporcionais, CLT 2025, pequenas empresas, 1/3 constitucional, regra 15 dias, avos férias",
    canonical: "/clt/ferias-proporcionais",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        generateCalculatorSchema(
          "Calculadora de Férias Proporcionais",
          "Calcule férias proporcionais por meses ou datas, com 1/3",
          "/clt/ferias-proporcionais"
        ),
        generateFAQSchema(faqItems),
      ],
    },
  });

  return (
    <>
      <section className="py-12">
        <Container size="md">
          <div className="max-w-4xl mx-auto space-y-6">
            <PageHeader
              title="Calculadora Férias Proporcionais CLT 2025"
              description="Escolha entre informar meses (0–12) ou deixar que a ferramenta conte automaticamente pelos dias trabalhados no período conforme CLT 2025."
            />

            <div className="bg-card rounded-lg p-6 border mb-6">
              <h2 className="text-xl font-semibold mb-4">Como Calcular Férias Proporcionais CLT 2025</h2>
              <p className="text-muted-foreground">
                Nossa calculadora de férias proporcionais CLT 2025 aplica a regra dos 15 dias: cada mês válido conta 2,5 dias de férias (30÷12). 
                Calcule por meses informados manualmente ou automaticamente por período trabalhado. Inclui salário + médias de variáveis e 1/3 constitucional. 
                Ideal para pequenas e médias empresas.
              </p>
            </div>

            <ProUpsell />

            <FeriasProporcionaisCalculator />

            <Notice variant="warning">
              <strong>Atenção:</strong> Resultado bruto (não inclui INSS/IRRF). Regras de arredondamento e médias podem variar por CCT/ACT.
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

export default FeriasProporcionais;
