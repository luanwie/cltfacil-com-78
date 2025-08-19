import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import DSRCalculator from "@/components/calculators/DSRCalculator";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import ProUpsell from "@/components/ProUpsell";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

const DSR = () => {
  const { isPro, remaining, loading } = useProAndUsage();

  useSEO({
    title: "Calculadora DSR - Descanso Semanal Remunerado | CLT Fácil",
    description:
      "Calcule DSR sobre horas extras. Ferramenta com cálculo automático do descanso semanal remunerado conforme a CLT.",
    keywords:
      "DSR, descanso semanal remunerado, horas extras, CLT, calculadora trabalhista",
    canonical: "/clt/dsr",
    type: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Calculadora DSR - Descanso Semanal Remunerado",
      description: "Calcule DSR sobre horas extras conforme a CLT",
      url: "/clt/dsr",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
    },
  });

  const faqData = [
    {
      question: "O que é o DSR sobre horas extras?",
      answer:
        "O Descanso Semanal Remunerado (DSR) sobre horas extras é um valor adicional devido quando há realização de horas extras.",
    },
    {
      question: "Como é calculado o DSR sobre horas extras?",
      answer:
        "DSR = (Valor das horas extras ÷ dias trabalhados) × dias de descanso (domingos/feriados).",
    },
    {
      question: "Quais dias são considerados de descanso?",
      answer:
        "Domingos e feriados do período. Em geral 4–5 domingos por mês, mais feriados nacionais/estaduais/municipais.",
    },
    {
      question: "O DSR é obrigatório?",
      answer:
        "Sim. Entendimento consolidado (Súmula 172 do TST). Quem faz hora extra tem direito ao DSR proporcional.",
    },
    {
      question: "Como definir a jornada mensal?",
      answer:
        "Padrão: 220h (44h semanais × 5 semanas). Para outras jornadas: horas semanais × 52 ÷ 12.",
    },
  ];

  const canUse = !!isPro || (typeof remaining === "number" && remaining > 0);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <PageHeader
            title="Calculadora DSR - Descanso Semanal Remunerado"
            description="Calcule o DSR sobre horas extras de forma rápida e precisa conforme a legislação trabalhista brasileira."
          />

          {/* Card com contador global/CTA PRO (some se já for PRO) */}
          <ProUpsell />

          {/* Gate de acesso */}
          {loading ? (
            <div className="rounded-2xl border p-6 bg-card shadow-sm">
              <div className="h-5 w-40 bg-muted rounded mb-3" />
              <div className="h-4 w-64 bg-muted rounded" />
            </div>
          ) : canUse ? (
            <DSRCalculator />
          ) : (
            <div className="rounded-2xl border bg-card shadow-sm p-6 flex flex-col items-start gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">
                Você já usou seus cálculos grátis
              </h3>
              <p className="text-sm text-muted-foreground">
                Torne-se PRO para continuar usando esta calculadora e todas as outras
                sem limites.
              </p>
              <Button asChild className="mt-2">
                <Link to="/assinar-pro">Assinar PRO</Link>
              </Button>
            </div>
          )}

          <Notice variant="info">
            <div>
              <p className="font-medium mb-1">Informação Importante</p>
              <p>
                Este cálculo é estimativo e pode variar conforme convenções coletivas,
                acordos sindicais e particularidades do contrato. Consulte sempre um
                profissional especializado.
              </p>
            </div>
          </Notice>

          <div className="bg-card rounded-lg p-6 border">
            <h3 className="font-semibold mb-3">Sobre o DSR</h3>
            <p className="text-sm text-muted-foreground mb-4">
              O Descanso Semanal Remunerado é um direito garantido pela Constituição e
              regulamentado pela CLT.
            </p>
            <p className="text-sm text-muted-foreground">
              Quando há horas extras, o trabalhador tem direito ao DSR proporcional
              sobre essas horas (Súmula 172 do TST).
            </p>
          </div>

          <FAQ title="Perguntas Frequentes sobre DSR" items={faqData} />
        </div>
      </Container>
    </div>
  );
};

export default DSR;
