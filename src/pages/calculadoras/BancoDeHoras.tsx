import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import BancoDeHorasCalculator from "@/components/calculators/BancoDeHorasCalculator";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";
import ProUpsell from "@/components/ProUpsell";
import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";

const BancoDeHoras = () => {
  const faqItems = [
    { question: "O que é banco de horas?", answer: "Sistema que permite compensar horas extras com folgas posteriores, conforme acordo. Sem acordo, horas extras devem ser pagas." },
    { question: "Qual é o prazo para compensar?", answer: "Práticas comuns: até 30 dias (compensação mensal), 6 meses (acordo individual escrito) ou 12 meses (acordo/conv. coletiva). Verifique sua CCT." },
    { question: "Como é calculado o saldo?", answer: "Saldo = (Horas trabalhadas − Jornada contratual) − Horas já compensadas. Positivo = crédito; negativo = débito." },
    { question: "Posso digitar hh:mm?", answer: "Sim. A ferramenta aceita tanto decimal (10.5) quanto hh:mm (10:30)." },
    { question: "E se o prazo expirar?", answer: "Horas não compensadas tendem a ser pagas como extras com adicional (ex.: 50% ou 100%), conforme legislação/negociação aplicável." },
  ];

  useSEO({
    title: "Banco de Horas | CLT Fácil",
    description: "Calcule saldo e prazos do banco de horas, incluindo projeção de pagamento ao expirar. Aceita decimal e hh:mm.",
    keywords: "banco de horas, compensação, prazo, CLT, hora extra, adicional",
    canonical: "/clt/banco-de-horas",
    jsonLd: {
      ...generateCalculatorSchema("Calculadora de Banco de Horas", "Calcule saldo e prazos do banco de horas", "/clt/banco-de-horas"),
      ...generateFAQSchema(faqItems),
    },
  });

  return (
    <Container className="py-8 space-y-8">
      <PageHeader
        title="Calculadora de Banco de Horas"
        description="Controle o saldo do banco de horas e visualize prazos de compensação e estimativa de pagamento ao expirar."
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <ProUpsell />
        <BancoDeHorasCalculator />

        <Notice>
          <strong>Aviso legal:</strong> Resultados são estimativas. Regras específicas podem constar em acordo/convênio coletivo. Consulte o RH.
        </Notice>

        <FAQ items={faqItems} />
      </div>
    </Container>
  );
};

export default BancoDeHoras;
