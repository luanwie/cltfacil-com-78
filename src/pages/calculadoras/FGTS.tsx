import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import FGTSCalculator from "@/components/calculators/FGTSCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";


const FGTS = () => {
  const faqItems = [
    {
      question: "Como funciona o depósito do FGTS?",
      answer: "O empregador deposita 8% do salário bruto mensalmente na conta do FGTS. O valor é atualizado mensalmente com TR + 3% ao ano."
    },
    {
      question: "Quando posso sacar o FGTS?",
      answer: "Principais situações: demissão sem justa causa, compra da casa própria, aposentadoria, doenças graves, ou outros casos previstos em lei."
    },
    {
      question: "Como funciona a multa de 40%?",
      answer: "Na demissão sem justa causa, o empregador paga multa de 40% sobre todo o saldo do FGTS. No acordo, a multa é de 20%."
    }
  ];

  useSEO({
    title: "FGTS + Projeção | CLT Fácil",
    description: "Calcule depósitos mensais do FGTS, projeções e multas. Ferramenta completa para acompanhar seu Fundo de Garantia.",
    keywords: "FGTS, fundo de garantia, depósito mensal, multa 40%, saque FGTS",
    canonical: "/clt/fgts",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de FGTS + Projeção",
        "Calcule depósitos mensais do FGTS e projeções com multas",
        "/clt/fgts"
      ),
      ...generateFAQSchema(faqItems)
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora de FGTS + Projeção"
            description="Calcule depósitos mensais do FGTS, projeções para o período e simule multas rescisórias."
          />
          
          <FGTSCalculator />
          
          <Notice variant="info">
            Valores não incluem rendimentos (TR + 3% ao ano). Para saldo exato, consulte o aplicativo oficial do FGTS.
          </Notice>
          
          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default FGTS;