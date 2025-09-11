import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import CustoFuncionarioCalculator from "@/components/calculators/CustoFuncionarioCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import UsageBanner from "@/components/UsageBanner";
import { goPro } from "@/utils/proRedirect";
import { useNavigate, useLocation } from "react-router-dom";

const CustoFuncionario = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();

  const faqItems = [
    {
      question: "Quais encargos estão incluídos no cálculo?",
      answer:
        "O cálculo inclui INSS patronal (20%), FGTS (8%), provisão de férias + 1/3, 13º salário proporcional, e outros encargos como SAT, Salário Educação e Sistema S (aproximadamente 5,8%).",
    },
    {
      question: "Os benefícios entram no cálculo dos encargos?",
      answer:
        "Não. Benefícios como vale-transporte, vale-refeição e plano de saúde são somados ao custo final, mas não geram incidência de encargos trabalhistas.",
    },
    {
      question: "Este valor considera rescisão?",
      answer:
        "Não. O cálculo mostra o custo mensal do funcionário. Para rescisão, use nossa calculadora específica de rescisão trabalhista que considera aviso prévio, multa do FGTS e outras verbas rescisórias.",
    },
    {
      question: "Posso usar este cálculo para MEI?",
      answer:
        "Não. Este cálculo é para funcionários CLT. MEIs não têm direito a férias, 13º salário ou FGTS, sendo contratados como pessoa jurídica com outras regras tributárias.",
    },
  ];

  useSEO({
    title: "Calculadora Custo do Funcionário CLT 2025 - Grátis | CLTFácil",
    description:
      "Calcule o custo real de contratar um funcionário CLT 2025. Inclui salário, encargos obrigatórios (INSS, FGTS, férias, 13º) e benefícios. Ferramenta essencial para empresários.",
    keywords: "custo funcionário, encargos trabalhistas, INSS patronal, FGTS, férias proporcionais, 13º salário, benefícios, CLT",
    canonical: "/clt/custo-funcionario",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de Custo do Funcionário",
        "Calcule o custo total mensal de um funcionário CLT incluindo salário, encargos e benefícios",
        "/clt/custo-funcionario"
      ),
      ...generateFAQSchema(faqItems),
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora Custo do Funcionário CLT 2025"
            description="Calcule o custo real mensal de contratar um funcionário CLT. Inclui salário, todos os encargos obrigatórios (INSS patronal, FGTS, férias + 1/3, 13º salário) e benefícios. Ferramenta essencial para empresários planejarem custos."
          />

          <div className="bg-card rounded-lg p-6 border mb-6">
            <h2 className="text-xl font-semibold mb-4">Como Calcular o Custo Real do Funcionário</h2>
            <p className="text-muted-foreground">
              O custo de um funcionário CLT vai muito além do salário. Nossa calculadora considera todos os encargos 
              obrigatórios: INSS patronal (20%), FGTS (8%), provisões de férias + 1/3 constitucional, 13º salário 
              proporcional e outros encargos (SAT, Salário Educação, Sistema S). Além disso, soma os benefícios 
              oferecidos como vale-transporte, vale-refeição e plano de saúde.
            </p>
          </div>

          {/* Banner GLOBAL com contador + CTA PRO */}
          <div id="usage-banner">
            <UsageBanner
              remaining={ctx.remaining}
              isPro={ctx.isPro}
              isLogged={ctx.isLogged}
              onGoPro={() => goPro(navigate, ctx.isLogged, location.pathname)}
            />
          </div>

          <CustoFuncionarioCalculator />

          <Notice variant="info">
            Este cálculo é uma estimativa baseada na legislação trabalhista atual. Valores podem variar conforme 
            convenções coletivas, acordos específicos da categoria ou benefícios adicionais da empresa.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default CustoFuncionario;