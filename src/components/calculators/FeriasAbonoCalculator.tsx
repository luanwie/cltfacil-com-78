import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Switch } from "@/components/ui/switch";
import { Calculator, RotateCcw, DollarSign } from "lucide-react";
import { formatBRL } from "@/lib/currency";

const FeriasAbonoCalculator = () => {
  const [salario, setSalario] = useState<number | undefined>();
  const [dias, setDias] = useState<number | undefined>(30);
  const [venderUmTerco, setVenderUmTerco] = useState<boolean>(false);

  const calcular = () => {
    if (!salario || salario <= 0) return null;
    const diasValidados = Math.max(0, Math.min(30, dias || 30));
    const ferias = (salario / 30) * diasValidados;
    const umTerco = ferias / 3;
    const abono = venderUmTerco ? (salario / 30) * Math.min(10, Math.floor(diasValidados / 3)) : 0;
    const total = ferias + umTerco + abono;
    
    return {
      salario: formatBRL(salario),
      diasValidados,
      ferias: formatBRL(ferias),
      umTerco: formatBRL(umTerco),
      abono: formatBRL(abono),
      total: formatBRL(total)
    };
  };

  const resultado = calcular();

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo de Férias + Abono
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Salário mensal (R$)</Label>
              <NumberInput value={salario} onChange={setSalario} prefix="R$" decimal min={0} placeholder="0,00" />
            </div>
            <div className="space-y-2">
              <Label>Dias de férias (0-30)</Label>
              <NumberInput value={dias} onChange={setDias} min={0} max={30} placeholder="30" />
            </div>
            <div className="space-y-2">
              <Label>Vender 1/3?</Label>
              <div className="flex items-center space-x-2">
                <Switch checked={venderUmTerco} onCheckedChange={setVenderUmTerco} />
                <Label className="text-sm">{venderUmTerco ? "Sim" : "Não"}</Label>
              </div>
            </div>
          </div>
          <Button onClick={() => {}} disabled={!salario || salario <= 0} className="w-full">
            <Calculator className="w-4 h-4 mr-2" />Calcular Férias
          </Button>
        </CardContent>
      </Card>

      {resultado && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Total de Férias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Férias ({resultado.diasValidados} dias):</span>
                <span>{resultado.ferias}</span>
              </div>
              <div className="flex justify-between">
                <span>1/3 constitucional:</span>
                <span>{resultado.umTerco}</span>
              </div>
              {venderUmTerco && (
                <div className="flex justify-between text-primary">
                  <span>Abono pecuniário:</span>
                  <span>{resultado.abono}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary">{resultado.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FeriasAbonoCalculator;