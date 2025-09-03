import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import ValeTransporteCalculator from "@/components/calculators/ValeTransporteCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import UsageBanner from "@/components/UsageBanner";
import { goPro } from "@/utils/proRedirect";
import { useNavigate, useLocation } from "react-router-dom";

const ValeTransporte = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();

  const faqItems = [
    {
      question: "O que é o limite de 6% do vale-transporte?",
      answer:
        "O empregado contribui com no máximo 6% do seu salário para o vale-transporte. Se o custo mensal for maior, a empresa arca com a diferença. Empresas podem adotar limite menor por política interna.",
    },
    {
      question: "O vale-transporte é obrigatório?",
      answer:
        "O empregador deve oferecer, mas o empregado pode optar por não receber se declarar por escrito que não usa transporte público.",
    },
    {
      question: "Como calcular o custo mensal do VT?",
      answer:
        "Multiplique o preço das viagens diárias pelo número de dias efetivamente utilizados no mês. A ferramenta permite ajustar viagens por dia, dias úteis e dias sem uso.",
    },
  ];

  useSEO({
    title: "Vale-Transporte (até 6%) | CLT Fácil",
    description:
      "Calcule desconto e custo do vale-transporte com limite de até 6%. Suporte a ida/volta com tarifas diferentes, dias sem uso e políticas internas.",
    keywords: "vale-transporte, desconto 6%, custo VT, transporte público, CLT",
    canonical: "/clt/vale-transporte",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de Vale-Transporte",
        "Calcule desconto do empregado (até 6%) e custo da empresa com modos simples e avançado",
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
            title="Calculadora de Vale-Transporte"
            description="Simule o vale-transporte com tarifa única ou ida/volta, dias úteis, dias sem uso e limite do empregado (até 6%)."
          />

          {/* Banner GLOBAL com contador + CTA PRO */}
          <div id="usage-banner">
            <UsageBanner
              remaining={ctx.remaining}
              isPro={ctx.isPro}
              isLogged={ctx.isLogged}
              onGoPro={() => goPro(navigate, ctx.isLogged, location.pathname)}
            />
          </div>

          <ValeTransporteCalculator />

          <Notice variant="info">
            O desconto do empregado é limitado a 6% do salário pela legislação. Empresas podem aplicar limite menor por política interna.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default ValeTransporte;
