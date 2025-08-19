import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import DSRComissoesCalculator from "@/components/calculators/DSRComissoesCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";
import { useProAndUsage } from '@/hooks/useProAndUsage';
import UsageBanner from '@/components/UsageBanner';
import { goPro } from '@/utils/proRedirect';
import { useNavigate, useLocation } from 'react-router-dom';


const DSRComissoes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();

  const faqItems = [
    {
      question: "O que é DSR sobre comissões?",
      answer: "DSR é o Descanso Semanal Remunerado. Comissões e vendas variáveis também geram direito ao DSR proporcional aos dias de descanso."
    },
    {
      question: "Como calcular o DSR sobre comissões?",
      answer: "Divide-se o total de comissões pelos dias trabalhados, multiplicando o resultado pelos dias de descanso no período."
    },
    {
      question: "DSR incide sobre todas as comissões?",
      answer: "Sim, DSR incide sobre comissões, prêmios e outras verbas variáveis recebidas habitualmente pelo trabalhador."
    }
  ];

  useSEO({
    title: "DSR sobre Comissões | CLT Fácil",
    description: "Calcule o DSR sobre comissões e vendas variáveis. Ferramenta precisa para cálculo do Descanso Semanal Remunerado.",
    keywords: "DSR comissões, descanso semanal remunerado, vendas variáveis, CLT",
    canonical: "/clt/dsr-comissoes",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de DSR sobre Comissões",
        "Calcule o DSR sobre comissões e vendas variáveis",
        "/clt/dsr-comissoes"
      ),
      ...generateFAQSchema(faqItems)
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora de DSR sobre Comissões"
            description="Calcule o Descanso Semanal Remunerado proporcional sobre comissões e vendas variáveis."
          />
          
          <div id="usage-banner">
            <UsageBanner
              remaining={ctx.remaining}
              isPro={ctx.isPro}
              isLogged={ctx.isLogged}
              onGoPro={() => goPro(navigate, ctx.isLogged, location.pathname)}
            />
          </div>
          
          <DSRComissoesCalculator />
          
          <Notice variant="info">
            DSR incide sobre todas as verbas variáveis habituais. Considere acordos coletivos que podem alterar a forma de cálculo.
          </Notice>
          
          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default DSRComissoes;