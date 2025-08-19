import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, RotateCcw, DollarSign, TrendingUp } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/currency";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import { useToast } from "@/hooks/use-toast";

type Resultado = {
  salario: string;
  depositoMensal: string;
  mesesValidados: number;
  totalPeriodo: string;
  saldoAtual: string;
  aliquotaMulta: string;
  multa: string;
  totalComMulta: string;
};

const FGTSCalculator = () => {
  const { isPro, remaining, loading, incrementCount } = useProAndUsage();
  const { toast } = useToast();

  const [salario, setSalario] = useState<number | undefined>();
  const [meses, setMeses] = useState<number | undefined>(12);
  const [saldoAtual, setSaldoAtual] = useState<number | undefined>(0);
  const [tipoMulta, setTipoMulta] = useState<string>("40");

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const countingRef = useRef(false);
  const freeLeft = typeof remaining === "number" ? remaining : 0;

  const canUseNow = isPro || freeLeft > 0;
  const canCalcInputs = !!salario && salario > 0 && !!meses && meses > 0;

  function calcularInterno(): Resultado | null {
    if (!canCalcInputs) return null;

    const mesesValidados = Math.max(1, Math.min(12, meses ?? 12));
    const saldoValidado = Math.max(0, saldoAtual ?? 0);
    const depositoMensal = (salario ?? 0) * 0.08;
    const totalPeriodo = depositoMensal * mesesValidados;

    const aliquota = tipoMulta === "40" ? 0.4 : tipoMulta === "20" ? 0.2 : 0;
    const multa = saldoValidado * aliquota;

    return {
      salario: formatBRL(salario ?? 0),
      depositoMensal: formatBRL(depositoMensal),
      mesesValidados,
      totalPeriodo: formatBRL(totalPeriodo),
      saldoAtual: formatBRL(saldoValidado),
      aliquotaMulta: formatPercent((parseFloat(tipoMulta) || 0) / 100),
      multa: formatBRL(multa),
      totalComMulta: formatBRL(saldoValidado + multa),
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
        description: "Preencha salário e meses corretamente.",
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
    setMeses(12);
    setSaldoAtual(0);
    setTipoMulta("40");
    setResultado(null);
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Simulação FGTS
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
              <Label htmlFor="meses">Meses para projeção</Label>
              <NumberInput
                id="meses"
                value={meses}
                onChange={setMeses}
                min={1}
                max={12}
                placeholder="12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="saldo-atual">Saldo atual FGTS (R$)</Label>
              <NumberInput
                id="saldo-atual"
                value={saldoAtual}
                onChange={setSaldoAtual}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo-multa">Tipo de multa rescisória</Label>
              <Select value={tipoMulta} onValueChange={setTipoMulta}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="40">40% - Demissão sem justa causa</SelectItem>
                  <SelectItem value="20">20% - Acordo (Art. 484-A)</SelectItem>
                  <SelectItem value="0">0% - Outras situações</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCalcular}
              disabled={!canCalcInputs || !canUseNow || loading}
              className="flex-1"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {isPro
                ? "Calcular FGTS"
                : canUseNow
                ? `Calcular FGTS (${freeLeft} restantes)`
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
                  <DollarSign className="w-4 h-4" />
                  Depósito Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {resultado.depositoMensal}
                </div>
                <p className="text-sm text-muted-foreground">8% do salário bruto</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Total no Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {resultado.totalPeriodo}
                </div>
                <p className="text-sm text-muted-foreground">
                  {resultado.mesesValidados} meses
                </p>
              </CardContent>
            </Card>
          </div>

          {(saldoAtual ?? 0) > 0 && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-destructive" />
                  Simulação de Multa Rescisória
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Saldo atual</div>
                    <div className="text-xl font-semibold">{resultado.saldoAtual}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Multa ({resultado.aliquotaMulta})
                    </div>
                    <div className="text-xl font-semibold text-destructive">
                      {resultado.multa}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total a receber</div>
                    <div className="text-xl font-bold text-primary">
                      {resultado.totalComMulta}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default FGTSCalculator;
