import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import IRRFCalculator from "@/components/calculators/IRRFCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";

import { useProAndUsage } from "@/hooks/useProAndUsage";
import UsageBanner from "@/components/UsageBanner";
import { navigateToProPage } from "@/utils/proRedirect";
import { useNavigate, useLocation } from "react-router-dom";

const IRRF = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();

  const faqItems = [
    {
      question: "Quando devo pagar IRRF?",
      answer:
        "O IRRF é retido automaticamente quando a base de cálculo (salário - INSS - dependentes - pensão) excede R$ 2.259,20.",
    },
    {
      question: "Quantos dependentes posso declarar?",
      answer:
        "Não há limite legal, mas cada dependente deduz R$ 189,59 da base de cálculo do IRRF. Devem estar declarados no IR anual.",
    },
    {
      question: "Pensão alimentícia reduz o IRRF?",
      answer:
        "Sim, pensão alimentícia judicial é dedutível integralmente da base de cálculo do Imposto de Renda.",
    },
  ];

  useSEO({
    title: "IRRF Mensal | CLT Fácil",
    description:
      "Calcule o Imposto de Renda Retido na Fonte com dependentes e deduções. Tabela progressiva atualizada para 2025.",
    keywords: "IRRF, imposto de renda, tabela progressiva, dependentes, dedução",
    canonical: "/clt/irrf",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de IRRF Mensal",
        "Calcule o Imposto de Renda Retido na Fonte com deduções",
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
            description="Calcule o Imposto de Renda Retido na Fonte considerando dependentes e deduções legais."
          />

          {/* Banner no topo da página (opcional, segue padrão atual) */}
          <div id="usage-banner">
            <UsageBanner
              remaining={ctx.remaining}
              isPro={ctx.isPro}
              isLogged={ctx.isLogged}
              onGoPro={() => navigateToProPage(navigate, ctx.isLogged, location.pathname)}
            />
          </div>

          <IRRFCalculator />

          <Notice variant="info">
            Cálculo baseado na tabela progressiva oficial. Considere outras deduções específicas que
            podem afetar o valor final.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default IRRF;
