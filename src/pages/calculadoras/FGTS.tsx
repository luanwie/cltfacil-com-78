import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import FGTSCalculator from "@/components/calculators/FGTSCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";
import ProUpsell from "@/components/ProUpsell";
import { MiniChatPrompt } from "@/components/IA/MiniChatPrompt";

const FGTS = () => {
  const faqItems = [
    {
      question: "Como funciona o depósito do FGTS?",
      answer:
        "O empregador deposita, em regra, 8% do salário bruto (2% para aprendiz). No emprego doméstico, além do 8% de FGTS há 3,2% de indenização mensal. Os valores sofrem atualização por TR + 3% a.a.",
    },
    {
      question: "Quando posso sacar o FGTS?",
      answer:
        "Principais hipóteses: demissão sem justa causa, compra da casa própria, aposentadoria, doenças graves, entre outras previstas em lei. Há ainda a modalidade de saque-aniversário.",
    },
    {
      question: "Como funciona a multa de 40%?",
      answer:
        "Na demissão sem justa causa, o empregador paga 40% sobre o saldo do FGTS. No acordo (art. 484-A), a multa é de 20%. Outras hipóteses não geram multa.",
    },
    {
      question: "FGTS incide sobre 13º salário?",
      answer:
        "Sim. O depósito sobre o 13º é feito aplicando a mesma alíquota do contrato (8% para CLT e doméstico, 2% para aprendiz) sobre o valor proporcional dos avos.",
    },
    {
      question: "Como é calculado o saque-aniversário?",
      answer:
        "Aplica-se um percentual por faixa de saldo, somado a uma parcela adicional fixa. A calculadora estima o valor segundo a tabela oficial.",
    },
  ];

  useSEO({
    title: "Calculadora de FGTS CLT 2025 - Grátis | CLTFácil",
    description:
      "Calcule FGTS conforme CLT 2025. Ferramenta gratuita para PMEs com cálculos exatos, exportação PDF e histórico. Inclui projeções, multa rescisória e saque-aniversário.",
    keywords:
      "calculadora FGTS, CLT 2025, pequenas empresas, fundo de garantia, depósito mensal, multa 40%, saque aniversário, trabalhador doméstico, aprendiz, 13º",
    canonical: "/clt/fgts",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de FGTS (Completa)",
        "Simule depósitos do FGTS, projeções com rendimento, 13º, multa e saque-aniversário",
        "/clt/fgts"
      ),
      ...generateFAQSchema(faqItems),
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora de FGTS CLT 2025"
            description="Calcule depósitos mensais, 13º proporcional, rendimento estimado, multa rescisória e simulação de saque-aniversário. Ferramenta completa para PMEs com todos os tipos de contrato."
          />

          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">Como Funciona a Calculadora de FGTS</h2>
            <p className="text-muted-foreground">
              Nossa calculadora de FGTS CLT 2025 permite simular depósitos para diferentes tipos de contrato (CLT, aprendiz, doméstico), 
              calcular o 13º proporcional, estimar rendimentos com TR + 3% ao ano, e simular a multa rescisória e saque-aniversário. 
              Ideal para pequenas e médias empresas que precisam de cálculos precisos e confiáveis.
            </p>
          </div>

          {/* Card PRO padronizado (contador/benefícios/CTA). Some automaticamente se o usuário já for PRO */}
          <ProUpsell />

          {/* Sem gate aqui: a calculadora faz o controle de uso internamente */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <FGTSCalculator />
            </div>

            <div className="space-y-6">
              <MiniChatPrompt 
                calculatorName="FGTS"
                calculatorContext="Esta calculadora permite calcular depósitos do FGTS, projeções com rendimento, multa rescisória e saque-aniversário. Use a IA para esclarecer dúvidas sobre FGTS, saques ou situações específicas."
              />
            </div>
          </div>

          <Notice variant="info">
            Os rendimentos exibidos são <strong>estimativas</strong> (3% a.a. + TR a.a. com
            capitalização mensal aproximada). Para valores oficiais, consulte o aplicativo do FGTS.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default FGTS;
