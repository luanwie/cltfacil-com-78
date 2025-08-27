import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import ValeTransporteCalculator from "@/components/calculators/ValeTransporteCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import UsageBanner from "@/components/UsageBanner";
import { navigateToProPage } from "@/utils/proRedirect";
import { useNavigate, useLocation } from "react-router-dom";

const ValeTransporte = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();

  const faqItems = [
    {
      question: "O que é o limite de 6% do vale-transporte?",
      answer:
        "O empregado contribui com no máximo 6% do seu salário para o vale-transporte. Se o custo for maior, a empresa arca com a diferença.",
    },
    {
      question: "O vale-transporte é obrigatório?",
      answer:
        "O empregador deve oferecer, mas o empregado pode optar por não receber se declarar por escrito que não usa transporte público.",
    },
    {
      question: "Como calcular o custo mensal do VT?",
      answer:
        "Multiplique o preço da condução pelo número de viagens diárias e pelos dias úteis do mês (ida + volta = 2 viagens).",
    },
  ];

  useSEO({
    title: "Vale-Transporte (6%) | CLT Fácil",
    description:
      "Calcule desconto e custo do vale-transporte. Ferramenta para cálculo do limite de 6% e divisão empresa/empregado.",
    keywords: "vale-transporte, desconto 6%, custo VT, transporte público, CLT",
    canonical: "/clt/vale-transporte",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de Vale-Transporte",
        "Calcule desconto e custo do vale-transporte com limite de 6%",
        "/clt/vale-transporte"
      ),
      ...generateFAQSchema(faqItems),
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora de Vale-Transporte (6%)"
            description="Calcule o desconto do empregado e o custo da empresa para o vale-transporte conforme o limite de 6%."
          />

          {/* Banner GLOBAL com contador + CTA PRO */}
          <div id="usage-banner">
            <UsageBanner
              remaining={ctx.remaining}
              isPro={ctx.isPro}
              isLogged={ctx.isLogged}
              onGoPro={() => navigateToProPage(navigate, ctx.isLogged, location.pathname)}
            />
          </div>

          <ValeTransporteCalculator />

          <Notice variant="info">
            Desconto limitado a 6% do salário bruto. Valores acima são custeados integralmente pela empresa.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default ValeTransporte;
