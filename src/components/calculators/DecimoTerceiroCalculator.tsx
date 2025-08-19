import React, { useState } from "react";
import { Calculator, RotateCcw, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import Notice from "@/components/ui/notice";
import { formatBRL, formatPercent } from "@/lib/currency";

const DecimoTerceiroCalculator = () => {
  const [salarioBase, setSalarioBase] = useState<number | undefined>();
  const [mesesTrabalhados, setMesesTrabalhados] = useState<number | undefined>();
  const [mediaVariaveis, setMediaVariaveis] = useState<number | undefined>();

  const handleMesesChange = (value: number | undefined) => {
    if (value !== undefined) {
      const mesesValidados = Math.trunc(Math.min(12, Math.max(0, value)));
      setMesesTrabalhados(mesesValidados);
    } else {
      setMesesTrabalhados(undefined);
    }
  };

  const calcularDecimoTerceiro = () => {
    if (!salarioBase || salarioBase <= 0) return null;

    const mesesValidos = Math.trunc(Math.min(12, Math.max(0, mesesTrabalhados || 0)));
    const avos = mesesValidos / 12;
    const base = salarioBase + (mediaVariaveis || 0);
    const totalBruto = base * avos;
    const primeiraParcela = totalBruto / 2;
    const segundaParcela = totalBruto - primeiraParcela;

    return {
      mesesValidos,
      avos,
      avosFracao: `${mesesValidos}/12`,
      avosPercentual: formatPercent(avos),
      baseCalculo: formatBRL(base),
      totalBruto: formatBRL(totalBruto),
      primeiraParcela: formatBRL(primeiraParcela),
      segundaParcela: formatBRL(segundaParcela)
    };
  };

  const resultado = calcularDecimoTerceiro();

  const limparFormulario = () => {
    setSalarioBase(undefined);
    setMesesTrabalhados(undefined);
    setMediaVariaveis(undefined);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Calculadora de 13º Proporcional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Notice variant="warning">
            Este cálculo não inclui descontos de INSS/IRRF. A regra dos 15 dias deve ser considerada ao informar os 'meses trabalhados'.
          </Notice>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="salario-base">Salário base mensal (R$)</Label>
              <NumberInput
                id="salario-base"
                value={salarioBase}
                onChange={setSalarioBase}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meses-trabalhados">
                Meses trabalhados no ano (0–12)
                <span className="text-sm text-muted-foreground ml-2">
                  (Considere mês completo se trabalhou 15 dias ou mais)
                </span>
              </Label>
              <NumberInput
                id="meses-trabalhados"
                value={mesesTrabalhados}
                onChange={handleMesesChange}
                min={0}
                max={12}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="media-variaveis">Média de variáveis (R$, opcional)</Label>
              <NumberInput
                id="media-variaveis"
                value={mediaVariaveis}
                onChange={setMediaVariaveis}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
              <p className="text-sm text-muted-foreground">
                Comissões, horas extras e outras variáveis
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {}} 
              disabled={!salarioBase || salarioBase <= 0}
              className="flex-1"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calcular
            </Button>
            <Button 
              variant="outline" 
              onClick={limparFormulario}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {resultado && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Resumo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avos:</span>
                    <span className="font-medium">{resultado.avosFracao}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Percentual:</span>
                    <span className="font-medium">{resultado.avosPercentual}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Base de Cálculo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {resultado.baseCalculo}
                </div>
                <p className="text-sm text-muted-foreground">
                  Salário + variáveis
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                13º Proporcional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-4">
                {resultado.totalBruto}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="p-3 rounded-lg bg-background border">
                  <div className="text-sm text-muted-foreground">1ª parcela (50%)</div>
                  <div className="text-xl font-semibold">{resultado.primeiraParcela}</div>
                </div>
                <div className="p-3 rounded-lg bg-background border">
                  <div className="text-sm text-muted-foreground">2ª parcela (50%)</div>
                  <div className="text-xl font-semibold">{resultado.segundaParcela}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Como Calculamos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Cálculo dos avos</p>
                    <p className="text-sm text-muted-foreground">
                      Avos = {resultado.mesesValidos} meses ÷ 12 = {resultado.avosFracao} ({resultado.avosPercentual})
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Base de cálculo</p>
                    <p className="text-sm text-muted-foreground">
                      Salário + média de variáveis = {resultado.baseCalculo}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">13º proporcional</p>
                    <p className="text-sm text-muted-foreground">
                      Base × avos = {resultado.baseCalculo} × {resultado.avosPercentual} = {resultado.totalBruto}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Divisão em parcelas</p>
                    <p className="text-sm text-muted-foreground">
                      1ª parcela: 50% = {resultado.primeiraParcela}<br />
                      2ª parcela: 50% = {resultado.segundaParcela}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-accent rounded-lg">
                <p className="text-sm text-accent-foreground">
                  <strong>Regra dos 15 dias:</strong> Se o trabalhador exerceu atividade por pelo menos 15 dias no mês, 
                  considera-se o mês completo para fins de cálculo do 13º salário.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DecimoTerceiroCalculator;