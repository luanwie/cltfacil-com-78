import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import AvisoPrevioCalculator from "@/components/calculators/AvisoPrevioCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";
import ProUpsell from "@/components/ProUpsell";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

const AvisoPrevio = () => {
  const { isPro, remaining, loading } = useProAndUsage();

  const faqItems = [
    {
      question: "Como funciona a progressão do aviso prévio?",
      answer:
        "Inicia com 30 dias e acrescenta 3 dias por ano trabalhado a partir do segundo ano, limitado a 90 dias totais.",
    },
    {
      question: "Qual a diferença entre aviso trabalhado e indenizado?",
      answer:
        "No trabalhado, o empregado cumpre o período normalmente. No indenizado, recebe o valor correspondente sem trabalhar.",
    },
    {
      question: "Quando o aviso prévio não se aplica?",
      answer:
        "Em casos de justa causa (empregado ou empregador), término de contrato determinado no prazo, ou acordo entre as partes.",
    },
  ];

  useSEO({
    title: "Aviso Prévio | CLT Fácil",
    description:
      "Calcule dias e indenização de aviso prévio com progressão por tempo de serviço. Ferramenta gratuita e precisa.",
    keywords: "aviso prévio, indenização, dias aviso, progressão, CLT",
    canonical: "/clt/aviso-previo",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de Aviso Prévio",
        "Calcule dias e indenização de aviso prévio",
        "/clt/aviso-previo"
      ),
      ...generateFAQSchema(faqItems),
    },
  });

  // Regra de acesso:
  // - PRO: libera
  // - Não PRO: libera se remaining > 0; bloqueia se remaining === 0.
  const canUse = !!isPro || (typeof remaining === "number" && remaining > 0);

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora de Aviso Prévio"
            description="Calcule os dias de aviso prévio e o valor da indenização com base no tempo de serviço."
          />

          {/* Card reutilizável: mostra contador de grátis + CTA PRO (oculta se já for PRO) */}
          <div className="mb-6">
            <ProUpsell />
          </div>

          {loading ? (
            // Skeleton enquanto carrega status PRO/uso
            <div className="rounded-2xl border p-6 bg-card shadow-sm">
              <div className="h-5 w-40 bg-muted rounded mb-3" />
              <div className="h-4 w-64 bg-muted rounded" />
            </div>
          ) : canUse ? (
            <AvisoPrevioCalculator
              // Recomendo manter estas flags se seu componente suportar:
              // showShareButtons={false}
              // showAds={true}
              // suppressUsageUi={true}
            />
          ) : (
            <div className="rounded-2xl border bg-card shadow-sm p-6 flex flex-col items-start gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Você já usou seus cálculos grátis</h3>
              <p className="text-sm text-muted-foreground">
                Torne-se PRO para continuar usando esta calculadora e todas as outras sem limites.
              </p>
              <Button asChild className="mt-2">
                <Link to="/assinar-pro">Assinar PRO</Link>
              </Button>
            </div>
          )}

          <Notice variant="info">
            Cálculo baseado na progressão legal do aviso prévio. Situações específicas podem
            alterar os valores. Consulte sempre o RH.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default AvisoPrevio;
