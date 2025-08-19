import { useEffect } from "react";
import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import DecimoTerceiroCalculator from "@/components/calculators/DecimoTerceiroCalculator";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";

import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";

const DecimoTerceiro = () => {
  const faqItems = [
    {
      question: "Como é calculado o 13º salário proporcional?",
      answer: "O 13º proporcional é calculado com base nos meses trabalhados no ano. A fórmula é: (salário + média de variáveis) × (meses trabalhados ÷ 12). Por exemplo, se trabalhou 6 meses, receberá 6/12 = 50% do 13º integral."
    },
    {
      question: "O que são as variáveis salariais no cálculo do 13º?",
      answer: "As variáveis incluem comissões, horas extras, adicionais noturnos, gratificações e outras parcelas que integram habitualmente o salário. Para o 13º, considera-se a média dessas variáveis recebidas durante o ano."
    },
    {
      question: "Como funciona a regra dos 15 dias para o 13º salário?",
      answer: "Se o trabalhador exerceu atividade por pelo menos 15 dias no mês, considera-se o mês completo para fins de cálculo do 13º salário. Menos de 15 dias, o mês não é computado."
    },
    {
      question: "Quando é pago o 13º salário?",
      answer: "O 13º é pago em duas parcelas: a primeira até 30 de novembro (50% do valor) e a segunda até 20 de dezembro (50% restante, com descontos de INSS e IRRF se aplicável)."
    },
    {
      question: "O 13º salário tem descontos?",
      answer: "A primeira parcela (paga até novembro) não tem descontos. A segunda parcela (paga em dezembro) sofre descontos de INSS e Imposto de Renda, se aplicável, calculados sobre o valor total do 13º."
    },
    {
      question: "Quem tem direito ao 13º salário proporcional?",
      answer: "Todo trabalhador com carteira assinada que trabalhou pelo menos 15 dias em um mês tem direito ao 13º proporcional. Isso inclui empregados domésticos, rurais, temporários e aposentados do INSS."
    }
  ];

  useSEO({
    title: "13º Proporcional | CLT Fácil",
    description: "Calcule 13º salário proporcional aos meses trabalhados. Ferramenta gratuita com divisão automática em parcelas e fórmulas detalhadas.",
    keywords: "13º proporcional, décimo terceiro, CLT, calculadora, meses trabalhados, parcelas",
    canonical: "https://clt-facil-calculadoras.lovable.app/clt/13o-proporcional",
    type: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        generateCalculatorSchema(
          "Calculadora de 13º Proporcional",
          "Calcule o 13º salário proporcional aos meses trabalhados no ano",
          "https://clt-facil-calculadoras.lovable.app/clt/13o-proporcional"
        ),
        generateFAQSchema(faqItems)
      ]
    }
  });

  return (
    <Container className="py-8 space-y-8">
      <PageHeader
        title="Calculadora de 13º Proporcional"
        description="Calcule o valor do 13º salário proporcional aos meses trabalhados no ano. Nossa ferramenta considera a regra dos 15 dias e divide automaticamente em parcelas."
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <DecimoTerceiroCalculator />
        
        <Notice>
          <strong>Aviso Legal:</strong> Esta calculadora é uma ferramenta auxiliar baseada na legislação trabalhista brasileira. 
          Para situações específicas ou dúvidas complexas, consulte sempre um profissional especializado em direito trabalhista.
        </Notice>
        
        <FAQ items={faqItems} />
      </div>
    </Container>
  );
};

export default DecimoTerceiro;