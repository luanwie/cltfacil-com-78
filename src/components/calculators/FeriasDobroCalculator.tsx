import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Calculator, DollarSign, RotateCcw } from "lucide-react";
import { formatBRL } from "@/lib/currency";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import { useToast } from "@/hooks/use-toast";

type Resultado = {
  salario: string;
  diasValidados: number;
  valorNormal: string;
  valorDobro: string;
  diferenca: string;
};

const FeriasDobroCalculator = () => {
  const { isPro, remaining, loading, incrementCount } = useProAndUsage();
  const { toast } = useToast();

  const [salario, setSalario] = useState<number | undefined>();
  const [diasVencidos, setDiasVencidos] = useState<number | undefined>(30);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const countingRef = useRef(false);
  const freeLeft = typeof remaining === "number" ? remaining : 0;

  function calcularInterno(): Resultado | null {
    if (!salario || salario <= 0) return null;

    const diasValidados = Math.max(0, Math.min(30, diasVencidos ?? 30));
    const base = (salario / 30) * diasValidados;
    const umTerco = base / 3;
    const total = 2 * (base + umTerco);

    return {
      salario: formatBRL(salario),
      diasValidados,
      valorNormal: formatBRL(base + umTerco),
      valorDobro: formatBRL(total),
      diferenca: formatBRL(total - (base + umTerco)),
    };
  }

  async function handleCalcular() {
    if (loading) return;

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
    setDiasVencidos(30);
    setResultado(null);
  }

  const botaoDisabled =
    loading || !salario || salario <= 0 || (!isPro && freeLeft === 0);

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo de Férias em Dobro
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
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
              <Label>Dias vencidos (0–30)</Label>
              <NumberInput
                value={diasVencidos}
                onChange={setDiasVencidos}
                min={0}
                max={30}
                placeholder="30"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCalcular} disabled={botaoDisabled} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              {isPro
                ? "Calcular"
                : freeLeft > 0
                ? `Calcular (${freeLeft} restantes)`
                : "Assine PRO para calcular"}
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
              Resultado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Valor normal + 1/3:</span>
                <span>{resultado.valorNormal}</span>
              </div>
              <div className="flex justify-between text-primary font-semibold">
                <span>Valor em dobro:</span>
                <span>{resultado.valorDobro}</span>
              </div>
              <div className="flex justify-between">
                <span>Diferença a mais:</span>
                <span>{resultado.diferenca}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FeriasDobroCalculator;
