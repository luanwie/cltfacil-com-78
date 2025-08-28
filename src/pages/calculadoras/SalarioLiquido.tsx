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
        "O salário líquido é o salário bruto menos os descontos obrigatórios: INSS, IRRF, vale-transporte (se aplicável) e outras deduções legais.",
    },
    {
      question: "Qual é a diferença entre salário bruto e líquido?",
      answer:
        "O salário bruto é o valor total antes dos descontos, enquanto o líquido é o que você efetivamente recebe após todos os descontos obrigatórios.",
    },
    {
      question: "O vale-transporte é obrigatório?",
      answer:
        "O vale-transporte é um benefício obrigatório oferecido pelo empregador, mas o desconto de até 6% do salário só ocorre se o funcionário utilizar o benefício.",
    },
  ];

  useSEO({
    title: "Salário Líquido | CLT Fácil",
    description:
      "Calcule seu salário líquido com descontos de INSS, IRRF e vale-transporte. Ferramenta gratuita e precisa para cálculos trabalhistas.",
    keywords: "salário líquido, INSS, IRRF, vale transporte, calculadora trabalhista",
    canonical: "/clt/salario-liquido",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de Salário Líquido",
        "Calcule o salário líquido com descontos de INSS, IRRF e deduções",
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
            description="Calcule seu salário líquido com todos os descontos obrigatórios: INSS, IRRF, vale-transporte e outras deduções."
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
