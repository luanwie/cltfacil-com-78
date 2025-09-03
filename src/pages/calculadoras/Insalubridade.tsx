import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import InsalubridadeCalculator from "@/components/calculators/InsalubridadeCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";
import { useProAndUsage } from '@/hooks/useProAndUsage';
import UsageBanner from '@/components/UsageBanner';
import { goPro } from '@/utils/proRedirect';
import { useNavigate, useLocation } from 'react-router-dom';

const Insalubridade = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();

  const faqItems = [
    {
      question: "Quais são os graus de insalubridade?",
      answer:
        "Mínimo (10%), médio (20%) e máximo (40%). A definição depende de laudo técnico conforme NR-15 e do agente nocivo.",
    },
    {
      question: "Qual base de cálculo usar?",
      answer:
        "Em regra, o salário mínimo. Porém, muitas CCT/ACT definem base sobre salário contratual. A calculadora permite escolher e editar o valor do mínimo.",
    },
    {
      question: "E se o EPI neutralizar o agente?",
      answer:
        "Se houver laudo atestando neutralização, o adicional pode deixar de ser devido. Habilite a opção 'EPI neutraliza' para simular.",
    },
    {
      question: "Há reflexos no FGTS?",
      answer:
        "Sim, mostramos a estimativa de FGTS (8%) incidente sobre o adicional. Outros reflexos podem depender de normas e habitualidade.",
    },
  ];

  useSEO({
    title: "Insalubridade (10/20/40% + personalizado) | CLT Fácil",
    description:
      "Calcule o adicional de insalubridade com base no salário mínimo ou contratual, incluindo proporcionalidade, valor-hora e FGTS.",
    keywords: "insalubridade, adicional, NR-15, salário mínimo, CCT, CLT, grau 10 20 40",
    canonical: "/clt/insalubridade",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de Insalubridade",
        "Calcule o adicional de insalubridade por grau, com base e percentuais personalizáveis",
        "/clt/insalubridade"
      ),
      ...generateFAQSchema(faqItems),
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora de Insalubridade"
            description="Base mínima ou contratual, grau personalizado, proporcionalidade, valor-hora e FGTS — tudo em um só lugar."
          />

          {/* Banner global de uso/CTA PRO */}
          <div id="usage-banner">
            <UsageBanner
              remaining={ctx.remaining}
              isPro={ctx.isPro}
              isLogged={ctx.isLogged}
              onGoPro={() => goPro(navigate, ctx.isLogged, location.pathname)}
            />
          </div>

          <InsalubridadeCalculator />

          <Notice variant="warning">
            O direito ao adicional depende de <strong>laudo técnico</strong>. Regras específicas podem
            adotar bases/percentuais diferentes via CCT/ACT. Os valores são estimativas didáticas.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default Insalubridade;
