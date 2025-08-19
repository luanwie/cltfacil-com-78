import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema } from "@/lib/seo";
import FeriasAbonoCalculator from "@/components/calculators/FeriasAbonoCalculator";
import Notice from "@/components/ui/notice";
import { useProAndUsage } from '@/hooks/useProAndUsage';
import UsageBanner from '@/components/UsageBanner';
import { goPro } from '@/utils/proRedirect';
import { useNavigate, useLocation } from 'react-router-dom';


const FeriasAbono = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();

  useSEO({
    title: "Férias + Abono (1/3) | CLT Fácil",
    description: "Calcule férias com opção de venda de 1/3. Ferramenta para cálculo de férias e abono pecuniário.",
    canonical: "/clt/ferias-abono",
    jsonLd: generateCalculatorSchema("Calculadora de Férias + Abono", "Calcule férias com opção de venda de 1/3", "/clt/ferias-abono")
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <PageHeader title="Calculadora de Férias + Abono (1/3)" description="Calcule suas férias com opção de venda de até 1/3 do período." />
            <div id="usage-banner">
              <UsageBanner
                remaining={ctx.remaining}
                isPro={ctx.isPro}
                isLogged={ctx.isLogged}
                onGoPro={() => goPro(navigate, ctx.isLogged, location.pathname)}
              />
            </div>
            <FeriasAbonoCalculator />
            <Notice variant="info">Abono pecuniário pode ser vendido até 10 dias. Consulte acordos coletivos.</Notice>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default FeriasAbono;