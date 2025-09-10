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
    title: "Calculadora Periculosidade CLT 2025 - Grátis | CLTFácil",
    description:
      "Calcule periculosidade conforme CLT 2025. Ferramenta gratuita para PMEs com cálculos exatos, exportação PDF e histórico. Adicional 30% + reflexos (férias, 13º, FGTS).",
    keywords: "calculadora periculosidade, CLT 2025, pequenas empresas, adicional 30%, NR-16, inflamáveis, eletricidade, vigilância, reflexos",
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
            title="Calculadora Periculosidade CLT 2025"
            description="Informe salário, adicionais fixos (opcional), exposição conforme CLT 2025 e veja adicional + reflexos (férias, 13º, FGTS). Ferramenta completa para PMEs."
          />

          <div className="bg-card rounded-lg p-6 border mb-6">
            <h2 className="text-xl font-semibold mb-4">Como Calcular Periculosidade CLT 2025</h2>
            <p className="text-muted-foreground">
              Nossa calculadora de periculosidade CLT 2025 aplica o adicional de 30% conforme NR-16 para atividades perigosas 
              (inflamáveis, explosivos, energia elétrica, vigilância). Calcula base flexível, proporcionalidade por exposição e 
              reflexos em férias, 13º e FGTS. Ideal para pequenas e médias empresas.
            </p>
          </div>

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
