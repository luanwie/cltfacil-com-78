import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import DSRComissoesCalculator from "@/components/calculators/DSRComissoesCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";
import ProUpsell from "@/components/ProUpsell";

const DSRComissoes = () => {
  const faqItems = [
    {
      question: "O que é DSR sobre comissões?",
      answer:
        "É o Descanso Semanal Remunerado proporcional devido sobre a remuneração variável (comissões, prêmios etc.).",
    },
    {
      question: "Como calcular?",
      answer:
        "DSR = (Comissões do período ÷ dias trabalhados) × dias de descanso (domingos/feriados e, se aplicável, sábados não trabalhados).",
    },
    {
      question: "Sábados contam como descanso?",
      answer:
        "Se a empresa não exige trabalho aos sábados, podem ser considerados como descanso. Ajuste no modo automático.",
    },
  ];

  useSEO({
    title: "Calculadora DSR sobre Comissões CLT 2025 - Grátis | CLTFácil",
    description: "Calcule DSR sobre comissões conforme CLT 2025. Ferramenta gratuita para PMEs com cálculos exatos, exportação PDF e histórico. Apuração manual ou automática.",
    keywords: "calculadora DSR comissões, CLT 2025, pequenas empresas, descanso semanal remunerado, vendas variáveis, comissionados",
    canonical: "/clt/dsr-comissoes",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de DSR sobre Comissões",
        "Calcule o DSR sobre comissões e vendas variáveis",
        "/clt/dsr-comissoes"
      ),
      ...generateFAQSchema(faqItems),
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora DSR sobre Comissões CLT 2025"
            description="Apure o DSR sobre comissões conforme CLT 2025. Modo manual ou automático (mês/ano, domingos/feriados/sábados e faltas). Ferramenta completa para PMEs."
          />

          <div className="bg-card rounded-lg p-6 border mb-6">
            <h2 className="text-xl font-semibold mb-4">Como Calcular DSR sobre Comissões CLT 2025</h2>
            <p className="text-muted-foreground">
              Nossa calculadora de DSR sobre comissões CLT 2025 calcula o descanso semanal remunerado proporcional 
              sobre vendas variáveis. Suporte para apuração manual ou automática considerando dias trabalhados, 
              domingos, feriados, sábados e faltas. Ideal para pequenas e médias empresas com vendedores comissionados.
            </p>
          </div>

          <ProUpsell />

          <DSRComissoesCalculator />

          <Notice variant="info">
            Consideramos práticas usuais de cálculo. Acordos/Convenções Coletivas podem prever regras próprias.
            Ajuste os campos (feriados, sábados, faltas) conforme a sua realidade.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default DSRComissoes;
