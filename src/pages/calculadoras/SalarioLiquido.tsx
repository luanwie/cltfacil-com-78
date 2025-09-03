import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import SalarioLiquidoCalculator from "@/components/calculators/SalarioLiquidoCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import UsageBanner from "@/components/UsageBanner";
import { goPro } from "@/utils/proRedirect";
import { useNavigate, useLocation } from "react-router-dom";

const SalarioLiquido = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();

  const faqItems = [
    {
      question: "Como é calculado o salário líquido?",
      answer:
        "O salário líquido considera: INSS progressivo, IRRF sobre a base após INSS com deduções (dependentes e pensão), e descontos facultativos como vale-transporte (até 6%), plano de saúde, VA/VR e outros.",
    },
    {
      question: "Outros proventos entram no cálculo?",
      answer:
        "Sim, comissões/adicionais que integram o salário compõem o bruto total e impactam INSS e IRRF.",
    },
    {
      question: "O vale-transporte é sempre descontado?",
      answer:
        "Só quando o empregado utiliza o benefício. O desconto é limitado a 6% do bruto total ou ao custo real do transporte, o que for menor.",
    },
  ];

  useSEO({
    title: "Salário Líquido | CLT Fácil",
    description:
      "Calcule seu salário líquido com INSS progressivo, IRRF com deduções e descontos facultativos (VT, VA/VR, plano de saúde).",
    keywords: "salário líquido, INSS, IRRF, vale-transporte, VA, VR, plano de saúde",
    canonical: "/clt/salario-liquido",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de Salário Líquido",
        "Calcule o salário líquido com INSS, IRRF e descontos facultativos (VT, VA/VR, plano de saúde)",
        "/clt/salario-liquido"
      ),
      ...generateFAQSchema(faqItems),
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora de Salário Líquido"
            description="Simule seu salário líquido com todos os descontos obrigatórios e facultativos: INSS, IRRF, VT, VA/VR, plano de saúde e outros."
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

          <SalarioLiquidoCalculator />

          <Notice variant="info">
            Este cálculo é uma estimativa baseada na legislação atual. Convenções coletivas e acordos específicos podem alterar os valores.
            Consulte sempre o RH da sua empresa.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default SalarioLiquido;
