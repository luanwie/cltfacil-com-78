import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import PericulosidadeCalculator from "@/components/calculators/PericulosidadeCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";

import { useProAndUsage } from "@/hooks/useProAndUsage";
import UsageBanner from "@/components/UsageBanner";
import { goPro } from "@/utils/proRedirect";
import { useNavigate, useLocation } from "react-router-dom";

const Periculosidade = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();

  const faqItems = [
    {
      question: "Quem tem direito ao adicional de periculosidade?",
      answer:
        "Trabalhadores expostos a atividades perigosas (NR-16): inflamáveis, explosivos, energia elétrica, vigilância/segurança, entre outros.",
    },
    {
      question: "Periculosidade e insalubridade podem ser acumuladas?",
      answer:
        "Não. A CLT veda o acúmulo; o trabalhador deve optar pelo adicional mais vantajoso (geralmente periculosidade de 30%).",
    },
    {
      question: "O adicional integra outras verbas?",
      answer:
        "Sim, quando habitual integra a base para férias + 1/3, 13º e FGTS. A calculadora exibe estimativas dos reflexos.",
    },
  ];

  useSEO({
    title: "Periculosidade (30%) + Reflexos | CLT Fácil",
    description:
      "Calcule o adicional de periculosidade (30%) com base flexível, exposição, e veja reflexos em férias, 13º e FGTS. Conforme NR-16.",
    keywords: "periculosidade, adicional 30%, NR-16, inflamáveis, eletricidade, vigilância",
    canonical: "/clt/periculosidade",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de Periculosidade",
        "Calcule o adicional de periculosidade com reflexos trabalhistas",
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
            description="Informe salário, adicionais fixos (opcional), exposição e veja adicional + reflexos (férias, 13º, FGTS)."
          />

          {/* Banner global de uso/CTA PRO (padrão) */}
          <div id="usage-banner">
            <UsageBanner
              remaining={ctx.remaining}
              isPro={ctx.isPro}
              isLogged={ctx.isLogged}
              onGoPro={() => goPro(navigate, ctx.isLogged, location.pathname)}
            />
          </div>

          <PericulosidadeCalculator />

          <Notice variant="warning">
            O direito ao adicional depende de **laudo técnico** e do enquadramento na **NR-16**.
            Convenções coletivas podem alterar base e proporcionalidade.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default Periculosidade;
