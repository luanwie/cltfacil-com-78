import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema } from "@/lib/seo";
import FeriasDobroCalculator from "@/components/calculators/FeriasDobroCalculator";
import Notice from "@/components/ui/notice";
import ProUpsell from "@/components/ProUpsell";

const FeriasDobro = () => {
  useSEO({
    title: "Calculadora Férias em Dobro CLT 2025 - Grátis | CLTFácil",
    description: "Calcule férias vencidas em dobro conforme CLT 2025. Ferramenta gratuita para PMEs com cálculos exatos, exportação PDF e histórico. Base salarial + médias.",
    keywords: "calculadora férias dobro, CLT 2025, pequenas empresas, férias vencidas, art 137, dobra 1/3, múltiplos períodos",
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
            title="Calculadora Férias em Dobro CLT 2025"
            description="Simule férias vencidas conforme CLT 2025 art. 137. Venda de múltiplos períodos, inclusão opcional da dobra sobre o 1/3. Ferramenta completa para PMEs."
          />

          <div className="bg-card rounded-lg p-6 border mb-6">
            <h2 className="text-xl font-semibold mb-4">Como Calcular Férias em Dobro CLT 2025</h2>
            <p className="text-muted-foreground">
              Nossa calculadora de férias em dobro CLT 2025 aplica o art. 137 da CLT para férias não concedidas no prazo. 
              Calcula base salarial + médias de variáveis, suporte para múltiplos períodos vencidos e opção de dobrar 
              também o 1/3 constitucional. Ideal para pequenas e médias empresas.
            </p>
          </div>

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
