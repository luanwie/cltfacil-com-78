import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import BancoDeHorasCalculator from "@/components/calculators/BancoDeHorasCalculator";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import ProUpsell from "@/components/ProUpsell";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

import { useSEO } from "@/hooks/useSEO";
import { generateCalculatorSchema, generateFAQSchema } from "@/lib/seo";

const BancoDeHoras = () => {
  const { isPro, remaining, loading } = useProAndUsage();

  const faqItems = [
    { question: "O que é banco de horas?", answer: "O banco de horas é um sistema que permite compensar horas extras trabalhadas com folgas em outros períodos, sem pagamento adicional. É regulamentado pela CLT e deve ser acordado entre empregador e empregado." },
    { question: "Qual é o prazo para compensar horas do banco?", answer: "As horas do banco devem ser compensadas em até 6 meses, conforme a legislação trabalhista. Caso não sejam compensadas neste prazo, devem ser pagas como horas extras com adicional de 50%." },
    { question: "Como funciona o cálculo do saldo de banco de horas?", answer: "O saldo é calculado subtraindo a jornada contratual das horas efetivamente trabalhadas, descontando as horas já compensadas. Saldo positivo indica crédito de horas; negativo indica débito." },
    { question: "Posso usar formato hh:mm para informar as horas?", answer: "Sim! A calculadora aceita tanto formato decimal (10.5) quanto hh:mm (10:30). O sistema converte automaticamente para facilitar o cálculo." },
    { question: "O que significa a equivalência em dias?", answer: "É uma referência aproximada de quantos dias de trabalho correspondem ao saldo de horas, baseada na jornada diária média (jornada mensal ÷ 30 dias)." },
    { question: "É obrigatório ter acordo para banco de horas?", answer: "Sim, o banco de horas deve ser instituído por acordo ou convenção coletiva, ou por acordo individual escrito. Sem acordo formal, as horas extras devem ser pagas mensalmente." },
  ];

  useSEO({
    title: "Banco de Horas | CLT Fácil",
    description: "Calcule e controle saldo de banco de horas. Ferramenta gratuita com conversão automática de formatos e cálculo de prazos de compensação.",
    keywords: "banco de horas, compensação, CLT, calculadora, horas extras, saldo",
    canonical: "/clt/banco-de-horas",
    jsonLd: {
      ...generateCalculatorSchema(
        "Calculadora de Banco de Horas",
        "Calcule e controle saldo de banco de horas com prazos de compensação",
        "/clt/banco-de-horas"
      ),
      ...generateFAQSchema(faqItems),
    },
  });

  const canUse = !!isPro || (typeof remaining === "number" && remaining > 0);

  return (
    <Container className="py-8 space-y-8">
      <PageHeader
        title="Calculadora de Banco de Horas"
        description="Controle e calcule seu saldo de banco de horas. Nossa ferramenta calcula créditos, débitos e prazos de compensação de acordo com a legislação trabalhista."
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Card com contador global e CTA PRO (suma se já for PRO) */}
        <ProUpsell />

        {loading ? (
          <div className="rounded-2xl border p-6 bg-card shadow-sm">
            <div className="h-5 w-40 bg-muted rounded mb-3" />
            <div className="h-4 w-64 bg-muted rounded" />
          </div>
        ) : canUse ? (
          <BancoDeHorasCalculator />
        ) : (
          <div className="rounded-2xl border bg-card shadow-sm p-6 flex flex-col items-start gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Você já usou seus cálculos grátis</h3>
            <p className="text-sm text-muted-foreground">
              Torne-se PRO para continuar usando esta calculadora e todas as outras sem limites.
            </p>
            <Button asChild className="mt-2">
              <Link to="/assinar-pro">Assinar PRO</Link>
            </Button>
          </div>
        )}

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
