import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema } from "@/lib/seo";
import FeriasDobroCalculator from "@/components/calculators/FeriasDobroCalculator";
import Notice from "@/components/ui/notice";
import ProUpsell from "@/components/ProUpsell";

const FeriasDobro = () => {
  useSEO({
    title: "Férias em Dobro | CLT Fácil",
    description: "Calcule férias vencidas em dobro com base salarial + médias, múltiplos períodos e opção de dobrar o 1/3.",
    canonical: "/clt/ferias-dobro",
    jsonLd: generateCalculatorSchema(
      "Calculadora de Férias em Dobro",
      "Calcule férias vencidas em dobro",
      "/clt/ferias-dobro"
    ),
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="Calculadora de Férias em Dobro"
            description="Simule férias vencidas conforme o art. 137 da CLT, com venda de múltiplos períodos e inclusão opcional da dobra sobre o 1/3."
          />

          <ProUpsell />

          <FeriasDobroCalculator />

          <Notice variant="info">
            Resultados brutos (não inclui INSS/IRRF). A decisão do STF que invalidou a Súmula 450
            afasta a dobra por <em>atraso no pagamento</em> quando as férias foram gozadas no prazo; aqui tratamos de
            férias <em>não concedidas no prazo</em>.
          </Notice>
        </div>
      </Container>
    </div>
  );
};

export default FeriasDobro;
