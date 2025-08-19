import { useEffect } from "react";
import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import BancoDeHorasCalculator from "@/components/calculators/BancoDeHorasCalculator";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";
import { useProAndUsage } from '@/hooks/useProAndUsage';
import UsageBanner from '@/components/UsageBanner';
import { goPro } from '@/utils/proRedirect';
import { useNavigate, useLocation } from 'react-router-dom';

import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";

const BancoDeHoras = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();

  const faqItems = [
    {
      question: "O que é banco de horas?",
      answer: "O banco de horas é um sistema que permite compensar horas extras trabalhadas com folgas em outros períodos, sem pagamento adicional. É regulamentado pela CLT e deve ser acordado entre empregador e empregado."
    },
    {
      question: "Qual é o prazo para compensar horas do banco?",
      answer: "As horas do banco devem ser compensadas em até 6 meses, conforme a legislação trabalhista. Caso não sejam compensadas neste prazo, devem ser pagas como horas extras com adicional de 50%."
    },
    {
      question: "Como funciona o cálculo do saldo de banco de horas?",
      answer: "O saldo é calculado subtraindo a jornada contratual das horas efetivamente trabalhadas, descontando as horas já compensadas. Saldo positivo indica crédito de horas; negativo indica débito."
    },
    {
      question: "Posso usar formato hh:mm para informar as horas?",
      answer: "Sim! A calculadora aceita tanto formato decimal (10.5) quanto hh:mm (10:30). O sistema converte automaticamente para facilitar o cálculo."
    },
    {
      question: "O que significa a equivalência em dias?",
      answer: "É uma referência aproximada de quantos dias de trabalho correspondem ao saldo de horas, baseada na jornada diária média (jornada mensal ÷ 30 dias)."
    },
    {
      question: "É obrigatório ter acordo para banco de horas?",
      answer: "Sim, o banco de horas deve ser instituído por acordo ou convenção coletiva, ou por acordo individual escrito. Sem acordo formal, as horas extras devem ser pagas mensalmente."
    }
  ];

  useSEO({
    title: "Banco de Horas | CLT Fácil",
    description: "Calcule e controle saldo de banco de horas. Ferramenta gratuita com conversão automática de formatos e cálculo de prazos de compensação.",
    keywords: "banco de horas, compensação, CLT, calculadora, horas extras, saldo",
    canonical: "https://clt-facil-calculadoras.lovable.app/clt/banco-de-horas",
    type: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        generateCalculatorSchema(
          "Calculadora de Banco de Horas",
          "Calcule e controle saldo de banco de horas com prazos de compensação",
          "https://clt-facil-calculadoras.lovable.app/clt/banco-de-horas"
        ),
        generateFAQSchema(faqItems)
      ]
    }
  });

  return (
    <Container className="py-8 space-y-8">
      <PageHeader
        title="Calculadora de Banco de Horas"
        description="Controle e calcule seu saldo de banco de horas. Nossa ferramenta calcula créditos, débitos e prazos de compensação de acordo com a legislação trabalhista."
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <div id="usage-banner">
          <UsageBanner
            remaining={ctx.remaining}
            isPro={ctx.isPro}
            isLogged={ctx.isLogged}
            onGoPro={() => goPro(navigate, ctx.isLogged, location.pathname)}
          />
        </div>
        <BancoDeHorasCalculator />
        
        <Notice>
          <strong>Aviso Legal:</strong> Esta calculadora é uma ferramenta auxiliar baseada na legislação trabalhista brasileira. 
          Para situações específicas ou dúvidas complexas, consulte sempre um profissional especializado em direito trabalhista.
        </Notice>
        
        <FAQ items={faqItems} />
      </div>
    </Container>
  );
};

export default BancoDeHoras;