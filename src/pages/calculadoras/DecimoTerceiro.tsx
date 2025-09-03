import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import DecimoTerceiroCalculator from "@/components/calculators/DecimoTerceiroCalculator";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";
import ProUpsell from "@/components/ProUpsell";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";

const DecimoTerceiro = () => {
  const faqItems = [
    {
      question: "Como é calculado o 13º salário?",
      answer: "Com base em 1/12 por mês válido (15+ dias). Fórmula: (salário + média de variáveis) × (meses/12).",
    },
    {
      question: "O que entra como variáveis?",
      answer: "Comissões, horas extras e adicionais habituais. Em geral, usa-se a média anual. Verifique sua CCT/ACT.",
    },
    {
      question: "Quando acontece o pagamento?",
      answer: "Usualmente em duas parcelas: 1ª até 30/11 e 2ª até 20/12. INSS/IRRF incidem na 2ª parcela quando houver.",
    },
    {
      question: "Como considerar desligamento no ano?",
      answer: "Use o modo “mês a mês” e marque apenas os meses com 15+ dias trabalhados até a rescisão.",
    },
    {
      question: "Há descontos nesta calculadora?",
      answer: "Mostramos o valor bruto. Descontos dependem de regras atuais de INSS/IRRF e podem variar.",
    },
  ];

  useSEO({
    title: "Décimo Terceiro | CLT Fácil",
    description: "Calcule o 13º salário: meses/avos, base com variáveis, parcelas e explicações práticas.",
    keywords: "13º salário, décimo terceiro, avos, CLT, proporcional",
    canonical: "/clt/decimo-terceiro",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de Décimo Terceiro",
        "Calcule o 13º salário com base em meses/avos e média de variáveis",
        "/clt/decimo-terceiro"
      ),
      ...generateFAQSchema(faqItems),
    },
  });

  return (
    <Container className="py-8 space-y-8">
      <PageHeader
        title="Calculadora de Décimo Terceiro"
        description="Apure os avos (mês a mês ou por total de meses), base com variáveis e valor bruto das duas parcelas."
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <ProUpsell />
        <DecimoTerceiroCalculator />

        <Notice>
          <strong>Aviso:</strong> O resultado é uma estimativa bruta. Para descontos e situações específicas,
          consulte a política do seu RH e sua CCT/ACT.
        </Notice>

        <FAQ items={faqItems} />
      </div>
    </Container>
  );
};

export default DecimoTerceiro;
