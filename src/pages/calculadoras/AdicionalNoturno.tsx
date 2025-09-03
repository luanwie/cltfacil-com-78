import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";
import AdicionalNoturnoCalculator from "@/components/calculators/AdicionalNoturnoCalculator";
import ProUpsell from "@/components/ProUpsell";

const AdicionalNoturno = () => {
  const faqItems = [
    {
      question: "Qual o percentual do adicional noturno?",
      answer:
        "No trabalho urbano, o adicional mínimo é de 20% (CLT, art. 73). No trabalho rural, a regra geral é 25% (com faixas horárias distintas conforme lavoura/pecuária). Convenções coletivas podem fixar percentuais diferentes.",
    },
    {
      question: "Qual o horário considerado noturno?",
      answer:
        "Urbano: das 22h às 5h. Rural: lavoura das 21h às 5h; pecuária das 20h às 4h. A jornada que começar no período noturno e se estender após o término continua recebendo adicional na prorrogação, conforme Súmula 60 do TST.",
    },
    {
      question: "A hora noturna tem duração diferente?",
      answer:
        "Somente no trabalho urbano: a hora noturna é reduzida para 52m30s (CLT, art. 73, §1º). No meio rural, a hora permanece com 60 minutos.",
    },
  ];

  return (
    <>
      <section className="py-12">
        <Container size="md">
          <PageHeader
            title="Calculadora de Adicional Noturno"
            description="Calcule o adicional noturno considerando regras urbanas (22h–5h, hora reduzida) e rurais (lavoura/pecuária), com opção de prorrogação após o período noturno."
          />
        </Container>
      </section>

      <section className="pb-12">
        <Container size="md">
          <div className="max-w-4xl mx-auto mb-8">
            <ProUpsell />
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <AdicionalNoturnoCalculator
              showShareButtons={false}
              showAds={true}
              suppressUsageUi={true}
            />
            <Notice variant="warning">
              <strong>Atenção:</strong> Este cálculo é uma estimativa baseada na CLT e na Súmula 60 do TST. Verifique sempre a CCT/ACT da sua categoria para percentuais e regras específicas.
            </Notice>
          </div>
        </Container>
      </section>

      <section className="py-12 bg-muted/30">
        <Container size="md">
          <FAQ items={faqItems} />
        </Container>
      </section>
    </>
  );
};

export default AdicionalNoturno;
