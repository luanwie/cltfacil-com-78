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
    title: "IRRF Mensal (Comparativo Completo × Simplificado) | CLT Fácil",
    description:
      "Calcule o IRRF mensal comparando automaticamente os regimes completo e simplificado (abatimento fixo R$ 528). Inclua dependentes, pensão e outras deduções.",
    keywords: "IRRF, imposto de renda, tabela progressiva, dependentes, simplificado mensal, abatimento 528",
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
            title="Calculadora de IRRF Mensal"
            description="Compare automaticamente o regime completo e o simplificado (abatimento R$ 528) e escolha o mais vantajoso."
          />

          {/* Banner no topo da página (padrão) */}
          <div id="usage-banner">
            <UsageBanner
              remaining={ctx.remaining}
              isPro={ctx.isPro}
              isLogged={ctx.isLogged}
              onGoPro={() => goPro(navigate, ctx.isLogged, location.pathname)}
            />
          </div>

          <IRRFCalculator />

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
