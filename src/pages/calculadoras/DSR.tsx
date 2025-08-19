import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import DSRCalculator from "@/components/calculators/DSRCalculator";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";
import { useProAndUsage } from '@/hooks/useProAndUsage';
import UsageBanner from '@/components/UsageBanner';
import { goPro } from '@/utils/proRedirect';
import { useNavigate, useLocation } from 'react-router-dom';

import { useSEO } from "@/hooks/useSEO";

const DSR = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();

  useSEO({
    title: "Calculadora DSR - Descanso Semanal Remunerado | CLT Fácil",
    description: "Calcule DSR sobre horas extras. Ferramenta gratuita com cálculo automático do descanso semanal remunerado conforme a CLT.",
    keywords: "DSR, descanso semanal remunerado, horas extras, CLT, calculadora trabalhista",
    canonical: "/clt/dsr",
    type: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Calculadora DSR - Descanso Semanal Remunerado",
      "description": "Calcule DSR sobre horas extras conforme a CLT",
      "url": "https://clt-facil-calculadoras.lovable.app/clt/dsr",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "BRL"
      }
    }
  });

  const faqData = [
    {
      question: "O que é o DSR sobre horas extras?",
      answer: "O Descanso Semanal Remunerado (DSR) sobre horas extras é um valor adicional que deve ser pago ao trabalhador quando ele realiza horas extras. É uma forma de remunerar o descanso semanal proporcional às horas extras trabalhadas."
    },
    {
      question: "Como é calculado o DSR sobre horas extras?",
      answer: "O DSR é calculado dividindo o valor total das horas extras pelos dias trabalhados no período e multiplicando pelos dias de descanso (domingos e feriados). Fórmula: (Valor das horas extras ÷ dias trabalhados) × dias de descanso."
    },
    {
      question: "Quais dias são considerados de descanso?",
      answer: "São considerados dias de descanso os domingos e feriados do período. Geralmente são 4 a 5 domingos por mês, mais os feriados nacionais, estaduais ou municipais que incidam no período."
    },
    {
      question: "O DSR sobre horas extras é obrigatório?",
      answer: "Sim, o DSR sobre horas extras é obrigatório conforme entendimento consolidado dos tribunais trabalhistas e está previsto na Súmula 172 do TST. Todo trabalhador que faz horas extras tem direito ao DSR proporcional."
    },
    {
      question: "Como definir a jornada mensal?",
      answer: "A jornada mensal padrão é de 220 horas (44 horas semanais × 5 semanas). Para jornadas diferentes, calcule: horas semanais × 52 semanas ÷ 12 meses. Por exemplo: 40h semanais = 173,33h mensais."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <PageHeader
            title="Calculadora DSR - Descanso Semanal Remunerado"
            description="Calcule o DSR sobre horas extras de forma rápida e precisa conforme a legislação trabalhista brasileira."
          />

          <Notice variant="info">
            <div>
              <p className="font-medium mb-1">Informação Importante</p>
              <p>Este cálculo é estimativo e pode variar conforme convenções coletivas, acordos sindicais e particularidades do contrato de trabalho. Consulte sempre um profissional especializado.</p>
            </div>
          </Notice>

          <div id="usage-banner">
            <UsageBanner
              remaining={ctx.remaining}
              isPro={ctx.isPro}
              isLogged={ctx.isLogged}
              onGoPro={() => goPro(navigate, ctx.isLogged, location.pathname)}
            />
          </div>

          <DSRCalculator />

          <div className="bg-card rounded-lg p-6 border">
            <h3 className="font-semibold mb-3">Sobre o DSR</h3>
            <p className="text-sm text-muted-foreground mb-4">
              O Descanso Semanal Remunerado é um direito fundamental do trabalhador brasileiro, garantido pela Constituição Federal e regulamentado pela CLT.
            </p>
            <p className="text-sm text-muted-foreground">
              Quando há realização de horas extras, o trabalhador tem direito ao DSR proporcional sobre essas horas, conforme Súmula 172 do TST.
            </p>
          </div>

          <FAQ 
            title="Perguntas Frequentes sobre DSR"
            items={faqData}
          />
        </div>
      </Container>
    </div>
  );
};

export default DSR;