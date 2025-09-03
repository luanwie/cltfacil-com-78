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
      question: "O INSS é calculado por faixas?",
      answer:
        "Sim. O cálculo é progressivo por faixas, com alíquotas aplicadas apenas sobre a parcela que cai em cada faixa. A alíquota efetiva é o percentual médio sobre a base.",
    },
    {
      question: "O INSS do 13º é somado ao do mês?",
      answer:
        "Não. O 13º tem cálculo próprio, feito separadamente da base mensal.",
    },
    {
      question: "Posso incluir comissões/variáveis no mês?",
      answer:
        "Sim. Some-as em 'outras remunerações do mês' para ver o efeito no INSS mensal.",
    },
  ];

  useSEO({
    title: "INSS Mensal + 13º | CLT Fácil",
    description:
      "Calcule sua contribuição ao INSS nas faixas progressivas, com opção de incluir 13º e outras remunerações do mês. Resultado completo e atualizado.",
    keywords: "INSS, contribuição, faixas progressivas, 13º salário, alíquota efetiva",
    canonical: "/clt/inss",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de INSS (Mês + 13º)",
        "Calcule a contribuição previdenciária mensal e do 13º com faixas progressivas",
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
            title="Calculadora de INSS (Mês + 13º)"
            description="Cálculo progressivo oficial, com outras remunerações do mês e 13º opcional."
          />

          {/* Banner global de uso/CTA PRO (mesmo padrão das demais) */}
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
            Os resultados são estimativas baseadas na tabela vigente. Em casos específicos
            (múltiplos vínculos, afastamentos, compensações), consulte seu RH/contabilidade.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default INSS;
