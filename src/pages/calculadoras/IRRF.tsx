import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import IRRFCalculator from "@/components/calculators/IRRFCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import UsageBanner from "@/components/UsageBanner";
import { goPro } from "@/utils/proRedirect";
import { useNavigate, useLocation } from "react-router-dom";
import { MiniChatPrompt } from "@/components/IA/MiniChatPrompt";

const IRRF = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();

  const faqItems = [
    {
      question: "Qual a diferença entre regime completo e simplificado mensal?",
      answer:
        "No completo, você deduz dependentes (R$ 189,59 cada), pensão judicial e outras deduções legais. No simplificado mensal, aplica-se um abatimento fixo de R$ 528 sem considerar deduções, e tributa-se a base restante.",
    },
    {
      question: "Posso informar salário bruto e deixar o sistema calcular o INSS?",
      answer:
        "Sim. Basta escolher o modo 'salário bruto'. Calculamos o INSS automaticamente e apuramos a base após INSS para o IRRF.",
    },
    {
      question: "Quais são exemplos de outras deduções legais?",
      answer:
        "Previdência complementar (PGBL), contribuição à previdência oficial em outro vínculo, entre outras despesas dedutíveis previstas na legislação.",
    },
  ];

  useSEO({
    title: "Calculadora IRRF CLT 2025 - Grátis | CLTFácil",
    description:
      "Calcule IRRF conforme CLT 2025. Ferramenta gratuita para PMEs com cálculos exatos, exportação PDF e histórico. Comparativo completo × simplificado automático.",
    keywords: "calculadora IRRF, CLT 2025, pequenas empresas, imposto de renda, tabela progressiva, dependentes, simplificado mensal, abatimento 528",
    canonical: "/clt/irrf",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de IRRF Mensal (Comparativo)",
        "Compare automaticamente o regime completo e o simplificado no IRRF mensal",
        "/clt/irrf"
      ),
      ...generateFAQSchema(faqItems),
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora IRRF CLT 2025"
            description="Compare automaticamente o regime completo e simplificado (abatimento R$ 528) conforme CLT 2025 e escolha o mais vantajoso. Ferramenta completa para PMEs."
          />

          <div className="bg-card rounded-lg p-6 border mb-6">
            <h2 className="text-xl font-semibold mb-4">Como Calcular IRRF Mensal CLT 2025</h2>
            <p className="text-muted-foreground">
              Nossa calculadora de IRRF CLT 2025 compara automaticamente os regimes completo (com dependentes e deduções) 
              e simplificado (abatimento fixo de R$ 528). Mostra qual é mais vantajoso para cada situação. 
              Ideal para pequenas e médias empresas e trabalhadores que querem otimizar seu desconto de IR.
            </p>
          </div>

          {/* Banner no topo da página (padrão) */}
          <div id="usage-banner">
            <UsageBanner
              remaining={ctx.remaining}
              isPro={ctx.isPro}
              isLogged={ctx.isLogged}
              onGoPro={() => goPro(navigate, ctx.isLogged, location.pathname)}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <IRRFCalculator />
            </div>

            <div className="space-y-6">
              <MiniChatPrompt 
                calculatorName="IRRF"
                calculatorContext="Esta calculadora permite calcular Imposto de Renda Retido na Fonte com faixas progressivas e deduções. Use a IA para esclarecer dúvidas sobre IRRF, deduções ou situações específicas."
              />
            </div>
          </div>

          <Notice variant="info">
            A ferramenta usa a tabela progressiva vigente. Para situações específicas (múltiplos vínculos,
            pensão parcial, rendas não salariais), consulte seu contador.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default IRRF;
