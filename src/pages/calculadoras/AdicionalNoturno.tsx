import { useState } from "react";
import { Calculator, RotateCcw, Clock, DollarSign, Percent, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";

import CargoUFSelector from "@/components/ui/cargo-uf-selector";
import AdicionalNoturnoCalculator from "@/components/calculators/AdicionalNoturnoCalculator";

interface CalculationInputs {
  salarioBase: number | undefined;
  horasNoturnas: number | undefined;
  percentualAdicional: number;
  jornada: number;
}

const AdicionalNoturno = () => {

  const faqItems = [
    {
      question: "Qual o percentual do adicional noturno?",
      answer: "O adicional noturno urbano é de 20% sobre a hora normal, conforme artigo 73 da CLT. Para trabalho rural, o percentual é de 25%."
    },
    {
      question: "Qual o horário considerado noturno?",
      answer: "Para trabalho urbano: das 22h às 5h. Para trabalho rural: lavoura das 21h às 5h, e pecuária das 20h às 4h."
    },
    {
      question: "A hora noturna tem duração diferente?",
      answer: "Sim, a hora noturna urbana tem 52 minutos e 30 segundos (redução de 7 minutos e 30 segundos), conforme artigo 73, §1º da CLT."
    }
  ];

  return (
    <>
      <section className="py-12">
        <Container size="md">
          <PageHeader
            title="Calculadora de Adicional Noturno"
            description="Calcule o adicional de 20% para trabalho realizado no período noturno (22h às 5h)."
          />
        </Container>
      </section>

      <section className="pb-12">
        <Container size="md">
          {/* Seletor rápido */}
          <div className="mb-8">
            <CargoUFSelector 
              title="Ir Direto para seu Cargo e Estado"
              description="Acesse a calculadora personalizada para sua situação específica"
            />
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <AdicionalNoturnoCalculator showShareButtons={false} showAds={true} />
            
            <Notice variant="warning">
              <strong>Atenção:</strong> Este cálculo é uma estimativa baseada na CLT. 
              Consulte sempre a CCT da sua categoria para verificar percentuais específicos.
            </Notice>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-muted/30">
        <Container size="md">
          <FAQ items={faqItems} />
        </Container>
      </section>
    </>
  );
};

export default AdicionalNoturno;