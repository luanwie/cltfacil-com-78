import { useState } from "react";
import { Calculator, RotateCcw, Calendar, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Notice from "@/components/ui/notice";

interface CalculationInputs {
  salarioBase: number | undefined;
  mesesTrabalhados: number | undefined;
  incluirTerco: boolean;
  arredondarDias: boolean;
}

const FeriasProporcionaisCalculator = () => {
  const [inputs, setInputs] = useState<CalculationInputs>({
    salarioBase: undefined,
    mesesTrabalhados: undefined,
    incluirTerco: true,
    arredondarDias: false
  });

  const [result, setResult] = useState<{
    diasFerias: number;
    valorFerias: number;
    valorTerco: number;
    totalReceber: number;
  } | null>(null);

  const handleCalculate = () => {
    if (!inputs.salarioBase || inputs.mesesTrabalhados === undefined) {
      return;
    }

    // Cálculo de férias proporcionais
    const diasBrutos = inputs.mesesTrabalhados * 2.5;
    const diasFerias = inputs.arredondarDias ? Math.ceil(diasBrutos) : Math.floor(diasBrutos);
    
    const valorDiario = inputs.salarioBase / 30;
    const valorFerias = valorDiario * diasFerias;
    const valorTerco = inputs.incluirTerco ? valorFerias / 3 : 0;
    const totalReceber = valorFerias + valorTerco;

    setResult({
      diasFerias,
      valorFerias,
      valorTerco,
      totalReceber
    });
  };

  const handleClear = () => {
    setInputs({
      salarioBase: undefined,
      mesesTrabalhados: undefined,
      incluirTerco: true,
      arredondarDias: false
    });
    setResult(null);
  };

  const canCalculate = inputs.salarioBase && inputs.mesesTrabalhados !== undefined && inputs.mesesTrabalhados >= 0 && inputs.mesesTrabalhados <= 12;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Dados para Cálculo
          </CardTitle>
          <CardDescription>
            Preencha as informações abaixo para calcular as férias proporcionais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salario">Salário Base Mensal</Label>
              <NumberInput
                id="salario"
                prefix="R$"
                decimal
                placeholder="0,00"
                value={inputs.salarioBase}
                onChange={(value) => setInputs(prev => ({ ...prev, salarioBase: value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meses">Meses Trabalhados</Label>
              <NumberInput
                id="meses"
                placeholder="0"
                min={0}
                max={12}
                value={inputs.mesesTrabalhados}
                onChange={(value) => setInputs(prev => ({ ...prev, mesesTrabalhados: value }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terco"
                checked={inputs.incluirTerco}
                onCheckedChange={(checked) => setInputs(prev => ({ ...prev, incluirTerco: !!checked }))}
              />
              <Label htmlFor="terco" className="text-sm font-normal">
                Incluir 1/3 constitucional
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="arredondar"
                checked={inputs.arredondarDias}
                onCheckedChange={(checked) => setInputs(prev => ({ ...prev, arredondarDias: !!checked }))}
              />
              <Label htmlFor="arredondar" className="text-sm font-normal">
                Arredondar dias para cima
              </Label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleCalculate}
              disabled={!canCalculate}
              className="flex-1"
            >
              <Calculator className="w-4 h-4" />
              Calcular
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <RotateCcw className="w-4 h-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultado */}
      {result && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Resultado do Cálculo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Dias de Férias Proporcionais</p>
                  <p className="font-semibold">{result.diasFerias} dias</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Valor das Férias</p>
                  <p className="font-semibold">R$ {result.valorFerias.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">1/3 Constitucional</p>
                  <p className="font-semibold">
                    {inputs.incluirTerco ? `R$ ${result.valorTerco.toFixed(2)}` : "Não incluído"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-primary">Total a Receber</p>
                  <p className="font-bold text-lg text-primary">R$ {result.totalReceber.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Como é calculado */}
      <Card>
        <CardHeader>
          <CardTitle>Como Calculamos as Férias Proporcionais?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">
                1
              </div>
              <div>
                <p className="font-medium">Calcular dias proporcionais</p>
                <p className="text-sm text-muted-foreground">Cada mês trabalhado = 2,5 dias de férias</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">
                2
              </div>
              <div>
                <p className="font-medium">Calcular valor das férias</p>
                <p className="text-sm text-muted-foreground">Valor das férias = (salário ÷ 30) × dias de férias</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">
                3
              </div>
              <div>
                <p className="font-medium">Adicionar 1/3 constitucional</p>
                <p className="text-sm text-muted-foreground">1/3 constitucional = valor das férias ÷ 3</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">
                4
              </div>
              <div>
                <p className="font-medium">Calcular total</p>
                <p className="text-sm text-muted-foreground">Total = férias + 1/3 constitucional</p>
              </div>
            </div>
          </div>

          <Notice variant="info">
            <strong>Importante:</strong> A cada 12 meses de trabalho, o empregado tem direito a 30 dias de férias. 
            As férias proporcionais são calculadas com base nos meses efetivamente trabalhados.
          </Notice>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeriasProporcionaisCalculator;