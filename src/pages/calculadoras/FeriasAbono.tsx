import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema } from "@/lib/seo";
import FeriasAbonoCalculator from "@/components/calculators/FeriasAbonoCalculator";
import Notice from "@/components/ui/notice";
import ProUpsell from "@/components/ProUpsell";

const FeriasAbono = () => {
  useSEO({
    title: "Férias + Abono (1/3) | CLT Fácil",
    description: "Calcule férias com venda de até 1/3, base com médias de variáveis e opção de 1/3 sobre o abono (quando aplicável).",
    canonical: "/clt/ferias-abono",
    jsonLd: generateCalculatorSchema(
      "Calculadora de Férias + Abono",
      "Calcule férias com opção de venda de até 1/3",
      "/clt/ferias-abono"
    ),
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora de Férias + Abono (1/3)"
            description="Simule férias com dias proporcionais, venda de 1/3 automática ou manual, e base com médias de variáveis."
          />

          <ProUpsell />

          <FeriasAbonoCalculator />

          <Notice variant="info">
            Resultados em valores brutos. Acordos/Convenções podem prever particularidades (ex.: 1/3 sobre o abono).
            Ajuste as opções conforme sua realidade.
          </Notice>
        </div>
      </Container>
    </div>
  );
};

export default FeriasAbono;
