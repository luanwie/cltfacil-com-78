import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Calculator, DollarSign } from "lucide-react";
import { formatBRL } from "@/lib/currency";

const FeriasDobroCalculator = () => {
  const [salario, setSalario] = useState<number | undefined>();
  const [diasVencidos, setDiasVencidos] = useState<number | undefined>(30);

  const calcular = () => {
    if (!salario || salario <= 0) return null;
    const diasValidados = Math.max(0, Math.min(30, diasVencidos || 30));
    const base = (salario / 30) * diasValidados;
    const umTerco = base / 3;
    const total = 2 * (base + umTerco);
    
    return {
      salario: formatBRL(salario),
      diasValidados,
      valorNormal: formatBRL(base + umTerco),
      valorDobro: formatBRL(total),
      diferenca: formatBRL(total - (base + umTerco))
    };
  };

  const resultado = calcular();

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="w-5 h-5" />Cálculo de Férias em Dobro</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Salário mensal (R$)</Label>
              <NumberInput value={salario} onChange={setSalario} prefix="R$" decimal min={0} placeholder="0,00" />
            </div>
            <div className="space-y-2">
              <Label>Dias vencidos (0-30)</Label>
              <NumberInput value={diasVencidos} onChange={setDiasVencidos} min={0} max={30} placeholder="30" />
            </div>
          </div>
          <Button onClick={() => {}} disabled={!salario || salario <= 0} className="w-full">
            <Calculator className="w-4 h-4 mr-2" />Calcular Férias em Dobro
          </Button>
        </CardContent>
      </Card>

      {resultado && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5" />Férias em Dobro</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Valor normal + 1/3:</span><span>{resultado.valorNormal}</span></div>
              <div className="flex justify-between text-destructive font-bold"><span>Valor em dobro:</span><span>{resultado.valorDobro}</span></div>
              <div className="flex justify-between text-primary"><span>Diferença a mais:</span><span>{resultado.diferenca}</span></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FeriasDobroCalculator;