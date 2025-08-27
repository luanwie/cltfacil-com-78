import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import PericulosidadeCalculator from "@/components/calculators/PericulosidadeCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";

import { useProAndUsage } from "@/hooks/useProAndUsage";
import UsageBanner from "@/components/UsageBanner";
import { navigateToProPage } from "@/utils/proRedirect";
import { useNavigate, useLocation } from "react-router-dom";

const Periculosidade = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();

  const faqItems = [
    {
      question: "Quem tem direito ao adicional de periculosidade?",
      answer:
        "Trabalhadores expostos a atividades perigosas como explosivos, inflamáveis, energia elétrica e roubos em bancos/postos. Lista completa na NR-16.",
    },
    {
      question: "Posso receber periculosidade e insalubridade juntos?",
      answer:
        "Não, a CLT veda o acúmulo. O trabalhador deve escolher o adicional mais vantajoso, que geralmente é a periculosidade (30%).",
    },
    {
      question: "A periculosidade integra o salário para outros cálculos?",
      answer:
        "Sim, a periculosidade integra o salário para cálculo de férias, 13º, FGTS, horas extras e outros direitos trabalhistas.",
    },
  ];

  useSEO({
    title: "Periculosidade (30%) | CLT Fácil",
    description:
      "Calcule o adicional de periculosidade de 30% sobre o salário. Ferramenta para atividades perigosas conforme NR-16.",
    keywords: "periculosidade, adicional 30%, atividades perigosas, NR-16, CLT",
    canonical: "/clt/periculosidade",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de Periculosidade",
        "Calcule o adicional de periculosidade de 30%",
        "/clt/periculosidade"
      ),
      ...generateFAQSchema(faqItems),
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora de Periculosidade (30%)"
            description="Calcule o adicional de periculosidade de 30% sobre o salário para atividades perigosas."
          />

          {/* Banner global de uso/CTA PRO (mesmo padrão) */}
          <div id="usage-banner">
            <UsageBanner
              remaining={ctx.remaining}
              isPro={ctx.isPro}
              isLogged={ctx.isLogged}
              onGoPro={() => navigateToProPage(navigate, ctx.isLogged, location.pathname)}
            />
          </div>

          <PericulosidadeCalculator />

          <Notice variant="warning">
            Direito ao adicional deve ser comprovado por laudo técnico. Consulte a NR-16 para lista
            completa de atividades perigosas.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default Periculosidade;
