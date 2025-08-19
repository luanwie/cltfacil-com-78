import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";
import FGTSCalculator from "@/components/calculators/FGTSCalculator";
import Notice from "@/components/ui/notice";
import FAQ from "@/components/ui/faq";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import ProUpsell from "@/components/ProUpsell";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

const FGTS = () => {
  const { isPro, remaining, loading } = useProAndUsage();

  const faqItems = [
    {
      question: "Como funciona o depósito do FGTS?",
      answer:
        "O empregador deposita 8% do salário bruto mensalmente na conta do FGTS. O valor é atualizado mensalmente com TR + 3% ao ano.",
    },
    {
      question: "Quando posso sacar o FGTS?",
      answer:
        "Principais situações: demissão sem justa causa, compra da casa própria, aposentadoria, doenças graves, ou outros casos previstos em lei.",
    },
    {
      question: "Como funciona a multa de 40%?",
      answer:
        "Na demissão sem justa causa, o empregador paga multa de 40% sobre todo o saldo do FGTS. No acordo, a multa é de 20%.",
    },
  ];

  useSEO({
    title: "FGTS + Projeção | CLT Fácil",
    description:
      "Calcule depósitos mensais do FGTS, projeções e multas. Ferramenta completa para acompanhar seu Fundo de Garantia.",
    keywords: "FGTS, fundo de garantia, depósito mensal, multa 40%, saque FGTS",
    canonical: "/clt/fgts",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de FGTS + Projeção",
        "Calcule depósitos mensais do FGTS e projeções com multas",
        "/clt/fgts"
      ),
      ...generateFAQSchema(faqItems),
    },
  });

  const canUse = !!isPro || (typeof remaining === "number" && remaining > 0);

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora de FGTS + Projeção"
            description="Calcule depósitos mensais do FGTS, projeções para o período e simule multas rescisórias."
          />

          {/* Card PRO padronizado (contador/benefícios/CTA) */}
          <ProUpsell />

          {/* Gate: calcula se PRO ou ainda há grátis; senão, bloqueia com CTA */}
          {loading ? (
            <div className="rounded-2xl border p-6 bg-card shadow-sm">
              <div className="h-5 w-40 bg-muted rounded mb-3" />
              <div className="h-4 w-64 bg-muted rounded" />
            </div>
          ) : canUse ? (
            <FGTSCalculator />
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
            Valores não incluem rendimentos (TR + 3% ao ano). Para saldo exato, consulte o
            aplicativo oficial do FGTS.
          </Notice>

          <FAQ items={faqItems} />
        </div>
      </Container>
    </div>
  );
};

export default FGTS;
