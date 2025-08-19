import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Calculator, RotateCcw, Clock, DollarSign } from "lucide-react";
import { formatBRL } from "@/lib/currency";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import { useToast } from "@/hooks/use-toast";

type Resultado = {
  salario: string;
  valorHora: string;
  horas50Validadas: number;
  horas100Validadas: number;
  valorHE50: string;
  valorHE100: string;
  totalHorasExtras: string;
  totalGeral: string;
  percentualExtra: string;
};

const HorasExtrasCalculator = () => {
  const { isPro, remaining, loading, incrementCount } = useProAndUsage();
  const { toast } = useToast();

  const [salario, setSalario] = useState<number | undefined>();
  const [jornada, setJornada] = useState<number | undefined>(220);
  const [horas50, setHoras50] = useState<number | undefined>(0);
  const [horas100, setHoras100] = useState<number | undefined>(0);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const countingRef = useRef(false);
  const freeLeft = typeof remaining === "number" ? remaining : 0;
  const canUseNow = isPro || freeLeft > 0;

  const canCalcInputs =
    !!salario && salario > 0 && !!jornada && jornada > 0 &&
    (horas50 ?? 0) >= 0 && (horas100 ?? 0) >= 0;

  function calcularInterno(): Resultado | null {
    if (!canCalcInputs) return null;

    const jornadaValidada = Math.max(1, jornada ?? 220);
    const h50 = Math.max(0, horas50 ?? 0);
    const h100 = Math.max(0, horas100 ?? 0);

    const valorHora = (salario ?? 0) / jornadaValidada;
    const valorHE50Num = valorHora * 1.5 * h50;
    const valorHE100Num = valorHora * 2 * h100;
    const totalHorasExtrasNum = valorHE50Num + valorHE100Num;
    const totalGeralNum = (salario ?? 0) + totalHorasExtrasNum;

    return {
      salario: formatBRL(salario ?? 0),
      valorHora: formatBRL(valorHora),
      horas50Validadas: h50,
      horas100Validadas: h100,
      valorHE50: formatBRL(valorHE50Num),
      valorHE100: formatBRL(valorHE100Num),
      totalHorasExtras: formatBRL(totalHorasExtrasNum),
      totalGeral: formatBRL(totalGeralNum),
      percentualExtra: ((totalHorasExtrasNum / (salario ?? 1)) * 100).toFixed(1),
    };
  }

  async function handleCalcular() {
    if (loading) return;
    if (!canUseNow) {
      toast({
        title: "Limite atingido",
        description: "Você já usou seus cálculos grátis. Torne-se PRO para continuar.",
        variant: "destructive",
      });
      return;
    }

    const r = calcularInterno();
    if (!r) {
      toast({
        title: "Campos inválidos",
        description: "Preencha salário, jornada e quantidades corretamente.",
      });
      return;
    }

    setResultado(r);

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
    setJornada(220);
    setHoras50(0);
    setHoras100(0);
    setResultado(null);
  }

  const botaoDisabled = loading || !canCalcInputs || (!isPro && freeLeft === 0);

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo de Horas Extras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
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

            <div className="space-y-2">
              <Label htmlFor="jornada">Jornada mensal (horas)</Label>
              <NumberInput
                id="jornada"
                value={jornada}
                onChange={setJornada}
                min={1}
                placeholder="220"
              />
              <p className="text-xs text-muted-foreground">Padrão: 220h (8h × 22 dias úteis)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horas-50">Horas extras 50%</Label>
              <NumberInput
                id="horas-50"
                value={horas50}
                onChange={setHoras50}
                min={0}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horas-100">Horas extras 100%</Label>
              <NumberInput
                id="horas-100"
                value={horas100}
                onChange={setHoras100}
                min={0}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">Domingos e feriados</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCalcular} disabled={botaoDisabled} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              {isPro
                ? "Calcular Horas Extras"
                : canUseNow
                ? `Calcular Horas Extras (${freeLeft} restantes)`
                : "Assine PRO para calcular"}
            </Button>
            <Button variant="outline" onClick={limpar}>
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
                  <Clock className="w-4 h-4" />
                  Valor da Hora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resultado.valorHora}</div>
                <p className="text-sm text-muted-foreground">Hora normal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Horas Extras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {resultado.totalHorasExtras}
                </div>
                <p className="text-sm text-muted-foreground">
                  +{resultado.percentualExtra}% do salário
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Horas Extras 50%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quantidade:</span>
                    <span className="font-medium">{resultado.horas50Validadas}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valor total:</span>
                    <span className="font-bold text-primary">{resultado.valorHE50}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Horas Extras 100%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quantidade:</span>
                    <span className="font-medium">{resultado.horas100Validadas}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valor total:</span>
                    <span className="font-bold text-primary">{resultado.valorHE100}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Total Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Salário base:</span>
                  <span className="font-medium">{resultado.salario}</span>
                </div>
                <div className="flex justify-between text-primary">
                  <span className="text-sm">Horas extras:</span>
                  <span className="font-medium">+{resultado.totalHorasExtras}</span>
                </div>
                <hr />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total:</span>
                  <span className="text-primary">{resultado.totalGeral}</span>
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
                    <p className="font-medium">Valor da Hora Normal</p>
                    <p className="text-sm text-muted-foreground">
                      Salário ÷ jornada mensal = {resultado.valorHora}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Horas Extras 50%</p>
                    <p className="text-sm text-muted-foreground">
                      Valor hora × 1,5 × quantidade = {resultado.valorHE50}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Horas Extras 100%</p>
                    <p className="text-sm text-muted-foreground">
                      Valor hora × 2 × quantidade = {resultado.valorHE100}
                    </p>
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

export default HorasExtrasCalculator;
