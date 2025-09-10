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
    title: "Calculadora Insalubridade CLT 2025 - Grátis | CLTFácil",
    description:
      "Calcule insalubridade conforme CLT 2025. Ferramenta gratuita para PMEs com cálculos exatos, exportação PDF e histórico. Graus 10/20/40% + personalizado, reflexos FGTS.",
    keywords: "calculadora insalubridade, CLT 2025, pequenas empresas, adicional insalubridade, NR-15, salário mínimo, grau 10 20 40, CCT",
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
            title="Calculadora Insalubridade CLT 2025"
            description="Base mínima ou contratual conforme CLT 2025, grau personalizado, proporcionalidade, valor-hora e FGTS. Ferramenta completa para PMEs."
          />

          <div className="bg-card rounded-lg p-6 border mb-6">
            <h2 className="text-xl font-semibold mb-4">Como Calcular Insalubridade CLT 2025</h2>
            <p className="text-muted-foreground">
              Nossa calculadora de insalubridade CLT 2025 aplica a NR-15 com graus mínimo (10%), médio (20%) e máximo (40%). 
              Base no salário mínimo ou contratual conforme CCT, proporcionalidade por exposição, valor-hora e reflexos no FGTS. 
              Ideal para pequenas e médias empresas que lidam com agentes nocivos.
            </p>
          </div>

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
