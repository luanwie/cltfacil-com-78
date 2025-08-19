import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Calculator, RotateCcw, DollarSign, Percent, Lock } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/currency";
import { calcularINSSSync } from "@/lib/tabelas";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import { UsageBanner } from "@/components/ui/usage-banner";
import { useNavigate, useLocation } from "react-router-dom";

const INSSCalculator = () => {
  const [salario, setSalario] = useState<number | undefined>();
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const { checkAndIncrementLimit, canCalculate, remainingCalculations, loading } = useCalculatorLimits();

  const handleCalculate = async () => {
    if (!salario || salario <= 0) return;

    const canProceed = await checkAndIncrementLimit();
    if (!canProceed) return;

    const resultado = calcularINSSSync(salario);
    
    setCalculationResult({
      salario: formatBRL(salario),
      valorINSS: formatBRL(resultado.valor),
      aliquotaEfetiva: formatPercent(resultado.aliquotaEfetiva),
      faixaMarginal: formatPercent(resultado.faixaMarginal),
      salarioLiquido: formatBRL(salario - resultado.valor)
    });
  };

  const limpar = () => {
    setSalario(undefined);
    setCalculationResult(null);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo do INSS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="salario">Salário mensal (R$)</Label>
            <NumberInput
              id="salario"
              value={salario}
              onChange={setSalario}
              prefix="R$"
              decimal
              min={0}
              placeholder="0,00"
            />
          </div>

          {!canCalculate && remainingCalculations === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">Limite atingido</span>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                Você atingiu o limite de {4} cálculos gratuitos. Torne-se PRO para cálculos ilimitados!
              </p>
            </div>
          )}

          {canCalculate && remainingCalculations !== Infinity && remainingCalculations > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                ⏳ Você tem <strong>{remainingCalculations}</strong> cálculo{remainingCalculations !== 1 ? 's' : ''} gratuito{remainingCalculations !== 1 ? 's' : ''} restante{remainingCalculations !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleCalculate}
              disabled={!salario || salario <= 0 || loading || !canCalculate}
              className="flex-1"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {loading ? "Verificando..." : "Calcular INSS"}
            </Button>
            <Button variant="outline" onClick={limpar}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {calculationResult && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Contribuição INSS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {calculationResult.valorINSS}
                </div>
                <p className="text-sm text-muted-foreground">
                  Desconto mensal
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Alíquotas
                </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Efetiva:</span>
                      <span className="font-medium">{calculationResult.aliquotaEfetiva}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Marginal:</span>
                      <span className="font-medium">{calculationResult.faixaMarginal}</span>
                    </div>
                  </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Resumo Final
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Salário bruto:</span>
                    <span className="font-medium">{calculationResult.salario}</span>
                  </div>
                  <div className="flex justify-between text-destructive">
                    <span className="text-sm">INSS:</span>
                    <span className="font-medium">-{calculationResult.valorINSS}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-medium">
                    <span>Após INSS:</span>
                    <span className="text-primary">{calculationResult.salarioLiquido}</span>
                  </div>
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
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
                  <div>
                    <p className="font-medium">Faixas Progressivas</p>
                    <p className="text-sm text-muted-foreground">INSS é calculado por faixas com alíquotas diferentes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <p className="font-medium">Teto da Contribuição</p>
                    <p className="text-sm text-muted-foreground">Salários acima de R$ 7.786,02 não têm desconto adicional</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <p className="font-medium">Alíquota Efetiva</p>
                    <p className="text-sm text-muted-foreground">Percentual real do desconto sobre o salário total</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default INSSCalculator;