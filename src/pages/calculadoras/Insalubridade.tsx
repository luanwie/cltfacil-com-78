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
        "Grau mínimo (10%), médio (20%) e máximo (40%) sobre o salário mínimo, conforme a NR-15. O grau depende do tipo e intensidade da exposição.",
    },
    {
      question: "Insalubridade pode ser calculada sobre o salário contratual?",
      answer:
        "Sim, algumas convenções coletivas preveem cálculo sobre o salário contratual. Consulte sempre seu acordo ou convenção coletiva.",
    },
    {
      question: "Posso receber insalubridade e periculosidade juntos?",
      answer:
        "Não, a lei veda o acúmulo. O trabalhador deve optar pelo adicional mais vantajoso, geralmente a periculosidade (30%).",
    },
  ];

  useSEO({
    title: "Insalubridade (10/20/40%) | CLT Fácil",
    description:
      "Calcule o adicional de insalubridade por grau. Ferramenta para atividades insalubres conforme NR-15.",
    keywords: "insalubridade, adicional insalubridade, NR-15, graus insalubridade, CLT",
    canonical: "/clt/insalubridade",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de Insalubridade",
        "Calcule o adicional de insalubridade por grau (10/20/40%)",
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
            title="Calculadora de Insalubridade (10/20/40%)"
            description="Calcule o adicional de insalubridade conforme o grau de exposição a agentes nocivos à saúde."
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
            Direito ao adicional deve ser comprovado por laudo técnico. Consulte a NR-15 e acordos
            coletivos para definir a base de cálculo.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default Insalubridade;
