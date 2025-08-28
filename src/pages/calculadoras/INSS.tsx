import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import INSSCalculator from "@/components/calculators/INSSCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";

import { useProAndUsage } from "@/hooks/useProAndUsage";
import UsageBanner from "@/components/UsageBanner";
import { goPro } from "@/utils/proRedirect";
import { useNavigate, useLocation } from "react-router-dom";

const INSS = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();

  const faqItems = [
    {
      question: "Qual é o teto do INSS em 2025?",
      answer:
        "O teto do INSS em 2025 é de R$ 7.786,02. Valores acima disso não têm incidência de contribuição previdenciária.",
    },
    {
      question: "Como funciona o cálculo progressivo do INSS?",
      answer:
        "O INSS é calculado por faixas progressivas. Cada faixa de salário tem uma alíquota diferente, aplicada apenas sobre o valor dentro daquela faixa.",
    },
    {
      question: "Posso pagar INSS complementar?",
      answer:
        "Sim, contribuintes podem pagar complementação para atingir o teto, melhorando a aposentadoria futura. Consulte a Previdência Social.",
    },
  ];

  useSEO({
    title: "INSS Mensal | CLT Fácil",
    description:
      "Calcule sua contribuição previdenciária mensal. Cálculo oficial do INSS por faixas progressivas com tabelas atualizadas.",
    keywords: "INSS, previdência social, contribuição, tabela INSS, alíquota",
    canonical: "/clt/inss",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de INSS Mensal",
        "Calcule a contribuição previdenciária mensal por faixas progressivas",
        "/clt/inss"
      ),
      ...generateFAQSchema(faqItems),
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora de INSS Mensal"
            description="Calcule sua contribuição previdenciária mensal com base nas faixas progressivas atuais do INSS."
          />

          {/* Opcional: Banner também no topo da página (mantém o padrão) */}
          <div id="usage-banner">
            <UsageBanner
              remaining={ctx.remaining}
              isPro={ctx.isPro}
              isLogged={ctx.isLogged}
              onGoPro={() => goPro(navigate, ctx.isLogged, location.pathname)}
            />
          </div>

          <INSSCalculator />

          <Notice variant="info">
            Cálculo baseado na tabela oficial do INSS. O valor pode variar conforme mudanças na
            legislação previdenciária.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default INSS;
