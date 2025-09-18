import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema } from "@/lib/seo";
import FeriasAbonoCalculator from "@/components/calculators/FeriasAbonoCalculator";
import Notice from "@/components/ui/notice";
import ProUpsell from "@/components/ProUpsell";
import { MiniChatPrompt } from "@/components/IA/MiniChatPrompt";

const FeriasAbono = () => {
  useSEO({
    title: "Calculadora Férias + Abono CLT 2025 - Grátis | CLTFácil",
    description: "Calcule férias com abono 1/3 conforme CLT 2025. Ferramenta gratuita para PMEs com cálculos exatos, exportação PDF e histórico. Base com médias de variáveis.",
    keywords: "calculadora férias abono, CLT 2025, pequenas empresas, 1/3 constitucional, venda férias, médias variáveis",
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
            title="Calculadora Férias + Abono CLT 2025"
            description="Simule férias com venda de 1/3 conforme CLT 2025. Dias proporcionais, venda automática ou manual, base com médias de variáveis. Ferramenta completa para PMEs."
          />

          <div className="bg-card rounded-lg p-6 border mb-6">
            <h2 className="text-xl font-semibold mb-4">Como Calcular Férias com Abono CLT 2025</h2>
            <p className="text-muted-foreground">
              Nossa calculadora de férias + abono CLT 2025 permite simular a venda de até 1/3 das férias. 
              Calcula dias proporcionais, aplica médias de variáveis (comissões, horas extras, adicionais) e 
              inclui opção de 1/3 sobre o abono conforme convenção coletiva. Ideal para pequenas e médias empresas.
            </p>
          </div>

          <ProUpsell />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <FeriasAbonoCalculator />
            </div>

            <div className="space-y-6">
              <MiniChatPrompt 
                calculatorName="Férias + Abono"
                calculatorContext="Esta calculadora permite calcular férias com abono pecuniário (venda de 1/3) incluindo 1/3 constitucional. Use a IA para esclarecer dúvidas sobre férias, abono ou situações específicas."
              />
            </div>
          </div>

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
