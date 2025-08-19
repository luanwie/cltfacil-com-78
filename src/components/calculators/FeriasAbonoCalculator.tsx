import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Switch } from "@/components/ui/switch";
import { Calculator, RotateCcw, DollarSign } from "lucide-react";
import { formatBRL } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { useProAndUsage } from "@/hooks/useProAndUsage";

type Resultado = {
  salario: string;
  diasValidados: number;
  ferias: string;
  umTerco: string;
  abono: string;
  total: string;
};

const FeriasAbonoCalculator = () => {
  const { toast } = useToast();
  const { isPro, remaining, loading, incrementCount } = useProAndUsage();

  const [salario, setSalario] = useState<number | undefined>();
  const [dias, setDias] = useState<number | undefined>(30);
  const [venderUmTerco, setVenderUmTerco] = useState<boolean>(false);

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const countingRef = useRef(false); // evita descontar 2x por clique

  function calcularInterno(): Resultado | null {
    if (!salario || salario <= 0) return null;

    const diasValidados = Math.max(0, Math.min(30, dias ?? 30));
    const feriasNum = (salario / 30) * diasValidados;
    const umTercoNum = feriasNum / 3;
    // abono: até 10 dias, e no máximo 1/3 do período vendido
    const abonoNum = venderUmTerco
      ? (salario / 30) * Math.min(10, Math.floor(diasValidados / 3))
      : 0;
    const totalNum = feriasNum + umTercoNum + abonoNum;

    return {
      salario: formatBRL(salario),
      diasValidados,
      ferias: formatBRL(feriasNum),
      umTerco: formatBRL(umTercoNum),
      abono: formatBRL(abonoNum),
      total: formatBRL(totalNum),
    };
  }

  async function handleCalcular() {
    if (loading) return;

    const freeLeft = typeof remaining === "number" ? remaining : 0;
    if (!isPro && freeLeft <= 0) {
      toast({
        title: "Limite atingido",
        description: "Você já usou seus cálculos grátis. Torne-se PRO para continuar.",
        variant: "destructive",
      });
      return;
    }

    const res = calcularInterno();
    if (!res) {
      toast({
        title: "Preencha os campos corretamente",
        description: "Informe um salário válido.",
      });
      return;
    }

    setResultado(res);

    // desconta 1 do global após cálculo bem-sucedido (somente não-PRO)
    if (!isPro && !countingRef.current) {
      countingRef.current = true;
      try {
        await (incrementCount?.() ?? Promise.resolve());
      } finally {
        setTimeout(() => (countingRef.current = false), 300);
      }
    }
  }

  function limpar() {
    setSalario(undefined);
    setDias(30);
    setVenderUmTerco(false);
    setResultado(null);
  }

  const botaoDisabled = loading || !salario || salario <= 0;

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
              <NumberInput
                value={salario}
                onChange={setSalario}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label>Dias de férias (0-30)</Label>
              <NumberInput
                value={dias}
                onChange={setDias}
                min={0}
                max={30}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label>Vender 1/3?</Label>
              <div className="flex items-center space-x-2">
                <Switch checked={venderUmTerco} onCheckedChange={setVenderUmTerco} />
                <Label className="text-sm">{venderUmTerco ? "Sim" : "Não"}</Label>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCalcular} disabled={botaoDisabled} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              Calcular Férias
            </Button>
            <Button variant="outline" onClick={limpar}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
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
