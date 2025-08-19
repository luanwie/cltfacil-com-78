import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import AvisoPrevioCalculator from "@/components/calculators/AvisoPrevioCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";
import { useProAndUsage } from '@/hooks/useProAndUsage';
import UsageBanner from '@/components/UsageBanner';
import { goPro } from '@/utils/proRedirect';
import { useNavigate, useLocation } from 'react-router-dom';


const AvisoPrevio = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();

  const faqItems = [
    {
      question: "Como funciona a progressão do aviso prévio?",
      answer: "Inicia com 30 dias e acrescenta 3 dias por ano trabalhado a partir do segundo ano, limitado a 90 dias totais."
    },
    {
      question: "Qual a diferença entre aviso trabalhado e indenizado?",
      answer: "No trabalhado, o empregado cumpre o período normalmente. No indenizado, recebe o valor correspondente sem trabalhar."
    },
    {
      question: "Quando o aviso prévio não se aplica?",
      answer: "Em casos de justa causa (empregado ou empregador), término de contrato determinado no prazo, ou acordo entre as partes."
    }
  ];

  useSEO({
    title: "Aviso Prévio | CLT Fácil",
    description: "Calcule dias e indenização de aviso prévio com progressão por tempo de serviço. Ferramenta gratuita e precisa.",
    keywords: "aviso prévio, indenização, dias aviso, progressão, CLT",
    canonical: "/clt/aviso-previo",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de Aviso Prévio",
        "Calcule dias e indenização de aviso prévio",
        "/clt/aviso-previo"
      ),
      ...generateFAQSchema(faqItems)
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora de Aviso Prévio"
            description="Calcule os dias de aviso prévio e valor da indenização com base no tempo de serviço."
          />
          
          <div id="usage-banner">
            <UsageBanner
              remaining={ctx.remaining}
              isPro={ctx.isPro}
              isLogged={ctx.isLogged}
              onGoPro={() => goPro(navigate, ctx.isLogged, location.pathname)}
            />
          </div>
          
          <AvisoPrevioCalculator />
          
          <Notice variant="info">
            Cálculo baseado na progressão legal do aviso prévio. Situações específicas podem alterar os valores. Consulte sempre o RH.
          </Notice>
          
          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default AvisoPrevio;