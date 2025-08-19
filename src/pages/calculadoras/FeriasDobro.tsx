import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema } from "@/lib/seo";
import FeriasDobroCalculator from "@/components/calculators/FeriasDobroCalculator";
import Notice from "@/components/ui/notice";


const FeriasDobro = () => {
  useSEO({
    title: "Férias em Dobro | CLT Fácil",
    description: "Calcule férias vencidas em dobro. Ferramenta para cálculo de férias não gozadas no prazo legal.",
    canonical: "/clt/ferias-dobro",
    jsonLd: generateCalculatorSchema("Calculadora de Férias em Dobro", "Calcule férias vencidas em dobro", "/clt/ferias-dobro")
  });

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <PageHeader title="Calculadora de Férias em Dobro" description="Calcule o valor das férias vencidas em dobro quando não gozadas no prazo legal." />
            <FeriasDobroCalculator />
            <Notice variant="warning">Férias em dobro aplicam-se quando não gozadas após 12 meses do período aquisitivo.</Notice>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default FeriasDobro;