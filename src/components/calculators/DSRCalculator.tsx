import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Calculator, DollarSign, Clock, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DSRData {
  salario: number;
  horasExtras: number;
  adicionalHE: number;
  jornadaMensal: number;
  diasTrabalhados: number;
  diasDescanso: number;
}

interface DSRResult {
  valorHora: number;
  valorHoraExtra: number;
  valorHorasExtras: number;
  dsr: number;
  total: number;
}

const DSRCalculator = () => {
  const [data, setData] = useState<DSRData>({
    salario: 0,
    horasExtras: 0,
    adicionalHE: 50,
    jornadaMensal: 220,
    diasTrabalhados: 0,
    diasDescanso: 0,
  });

  const [result, setResult] = useState<DSRResult | null>(null);

  const updateField = (field: keyof DSRData, value: number | undefined) => {
    setData(prev => ({
      ...prev,
      [field]: value || 0
    }));
  };

  const calculateDSR = () => {
    if (data.salario <= 0 || data.horasExtras <= 0 || data.jornadaMensal <= 0 || 
        data.diasTrabalhados <= 0) {
      return;
    }

    const valorHora = data.salario / data.jornadaMensal;
    const valorHoraExtra = valorHora * (1 + data.adicionalHE / 100);
    const valorHorasExtras = valorHoraExtra * data.horasExtras;
    const dsr = data.diasTrabalhados > 0 ? (valorHorasExtras / data.diasTrabalhados) * data.diasDescanso : 0;
    const total = valorHorasExtras + dsr;

    setResult({
      valorHora,
      valorHoraExtra,
      valorHorasExtras,
      dsr,
      total
    });
  };

  const clearForm = () => {
    setData({
      salario: 0,
      horasExtras: 0,
      adicionalHE: 50,
      jornadaMensal: 220,
      diasTrabalhados: 0,
      diasDescanso: 0,
    });
    setResult(null);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const isValid = data.salario > 0 && data.horasExtras > 0 && data.jornadaMensal > 0 && data.diasTrabalhados > 0;

  return (
    <div className="space-y-6">
      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Dados para Cálculo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salario">Salário base mensal (R$)</Label>
              <NumberInput
                id="salario"
                prefix="R$"
                decimal
                value={data.salario}
                onChange={(value) => updateField('salario', value)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horasExtras">Horas extras no período (h)</Label>
              <NumberInput
                id="horasExtras"
                decimal
                value={data.horasExtras}
                onChange={(value) => updateField('horasExtras', value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adicionalHE">Adicional da hora extra (%)</Label>
              <NumberInput
                id="adicionalHE"
                suffix="%"
                value={data.adicionalHE}
                onChange={(value) => updateField('adicionalHE', value)}
                placeholder="50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jornadaMensal">
                Jornada mensal (h)
                <span className="text-sm text-muted-foreground ml-1">
                  (padrão: 220h)
                </span>
              </Label>
              <NumberInput
                id="jornadaMensal"
                suffix="h"
                value={data.jornadaMensal}
                onChange={(value) => updateField('jornadaMensal', value)}
                placeholder="220"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diasTrabalhados">
                Dias trabalhados no período
                <span className="text-sm text-muted-foreground block">
                  dias úteis/trabalhados no mês
                </span>
              </Label>
              <NumberInput
                id="diasTrabalhados"
                value={data.diasTrabalhados}
                onChange={(value) => updateField('diasTrabalhados', value)}
                placeholder="22"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diasDescanso">
                Dias de descanso no período
                <span className="text-sm text-muted-foreground block">
                  domingos + feriados
                </span>
              </Label>
              <NumberInput
                id="diasDescanso"
                value={data.diasDescanso}
                onChange={(value) => updateField('diasDescanso', value)}
                placeholder="8"
              />
            </div>
          </div>

          <Separator />

          <div className="flex gap-3 flex-wrap">
            <Button 
              onClick={calculateDSR}
              disabled={!isValid}
              className="flex-1 min-w-[120px]"
            >
              <Calculator className="mr-2 h-4 w-4" />
              Calcular DSR
            </Button>
            
            <Button 
              variant="outline" 
              onClick={clearForm}
              className="flex-1 min-w-[120px]"
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1">Valor da hora</p>
              <p className="text-lg font-semibold">{formatCurrency(result.valorHora)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Horas Extras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Valor hora extra</p>
                <p className="font-medium">{formatCurrency(result.valorHoraExtra)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total horas extras</p>
                <p className="text-lg font-semibold">{formatCurrency(result.valorHorasExtras)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-primary">
                <Calendar className="h-4 w-4" />
                DSR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1">DSR sobre horas extras</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(result.dsr)}</p>
            </CardContent>
          </Card>

          <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-400">
                <DollarSign className="h-4 w-4" />
                Total a Receber
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1">Horas extras + DSR</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-400">{formatCurrency(result.total)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Como Calculamos */}
      <Card>
        <CardHeader>
          <CardTitle>Como Calculamos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Valor da hora</p>
                <p className="text-sm text-muted-foreground">Salário ÷ jornada mensal</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Valor hora extra</p>
                <p className="text-sm text-muted-foreground">Valor hora × (1 + adicional%)</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">DSR sobre horas extras</p>
                <p className="text-sm text-muted-foreground">(Valor horas extras ÷ dias trabalhados) × dias descanso</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div>
                <p className="font-medium">Total a receber</p>
                <p className="text-sm text-muted-foreground">Horas extras + DSR</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DSRCalculator;