import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Calculator, RotateCcw, DollarSign, Calendar } from "lucide-react";
import { formatBRL } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { useProAndUsage } from "@/hooks/useProAndUsage";

type Resultado = {
  comissoes: string;
  diasTrabalhados: number;
  diasDescanso: number;
  mediaDiaria: string;
  valorDSR: string;
  totalComDSR: string;
  percentualDSR: string;
};

const DSRComissoesCalculator = () => {
  const { toast } = useToast();
  const { isPro, remaining, loading, incrementCount } = useProAndUsage();

  const [comissoes, setComissoes] = useState<number | undefined>();
  const [diasTrabalhados, setDiasTrabalhados] = useState<number | undefined>(22);
  const [diasDescanso, setDiasDescanso] = useState<number | undefined>(8);

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const countingRef = useRef(false); // evita descontar 2x no mesmo clique

  function calcularInterno(): Resultado | null {
    if (!comissoes || comissoes <= 0 || !diasTrabalhados || diasTrabalhados <= 0) return null;

    const diasTrabalhadosValidados = Math.max(1, diasTrabalhados);
    const diasDescansoValidados = Math.max(0, diasDescanso || 0);

    const mediaDiariaNum = comissoes / diasTrabalhadosValidados;
    const valorDSRNum = mediaDiariaNum * diasDescansoValidados;
    const totalComDSRNum = comissoes + valorDSRNum;

    return {
      comissoes: formatBRL(comissoes),
      diasTrabalhados: diasTrabalhadosValidados,
      diasDescanso: diasDescansoValidados,
      mediaDiaria: formatBRL(mediaDiariaNum),
      valorDSR: formatBRL(valorDSRNum),
      totalComDSR: formatBRL(totalComDSRNum),
      percentualDSR: ((valorDSRNum / comissoes) * 100).toFixed(1),
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
        description: "Informe comissões e dias trabalhados válidos.",
      });
      return;
    }

    setResultado(res);

    // desconta 1 do global (somente não-PRO) após cálculo bem-sucedido
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
    setComissoes(undefined);
    setDiasTrabalhados(22);
    setDiasDescanso(8);
    setResultado(null);
  }

  const botaoDisabled = loading || !comissoes || comissoes <= 0 || !diasTrabalhados || diasTrabalhados <= 0;

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo DSR sobre Comissões
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="comissoes">Comissões no período (R$)</Label>
              <NumberInput
                id="comissoes"
                value={comissoes}
                onChange={setComissoes}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dias-trabalhados">Dias trabalhados</Label>
              <NumberInput
                id="dias-trabalhados"
                value={diasTrabalhados}
                onChange={setDiasTrabalhados}
                min={1}
                max={31}
                placeholder="22"
              />
              <p className="text-xs text-muted-foreground">Padrão: 22 dias úteis</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dias-descanso">Dias de descanso</Label>
              <NumberInput
                id="dias-descanso"
                value={diasDescanso}
                onChange={setDiasDescanso}
                min={0}
                max={31}
                placeholder="8"
              />
              <p className="text-xs text-muted-foreground">Domingos + feriados</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCalcular} disabled={botaoDisabled} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              Calcular DSR
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
                  <Calendar className="w-4 h-4" />
                  Média Diária
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resultado.mediaDiaria}</div>
                <p className="text-sm text-muted-foreground">Por dia trabalhado</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  DSR Devido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{resultado.valorDSR}</div>
                <p className="text-sm text-muted-foreground">+{resultado.percentualDSR}% das comissões</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Total a Receber
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Comissões:</span>
                  <span className="font-medium">{resultado.comissoes}</span>
                </div>
                <div className="flex justify-between text-primary">
                  <span className="text-sm">DSR:</span>
                  <span className="font-medium">+{resultado.valorDSR}</span>
                </div>
                <hr />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total:</span>
                  <span className="text-primary">{resultado.totalComDSR}</span>
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
                    <p className="font-medium">Média Diária</p>
                    <p className="text-sm text-muted-foreground">
                      Comissões ÷ dias trabalhados = {resultado.mediaDiaria}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <p className="font-medium">DSR Proporcional</p>
                    <p className="text-sm text-muted-foreground">
                      Média diária × dias de descanso = {resultado.valorDSR}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <p className="font-medium">Total Final</p>
                    <p className="text-sm text-muted-foreground">
                      Comissões + DSR = {resultado.totalComDSR}
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

export default DSRComissoesCalculator;
