import { useRef, useState } from "react";
import { Calculator, RotateCcw, Clock, DollarSign, Percent, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import Notice from "@/components/ui/notice";
import { formatBRL, formatPercent } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { PDFExportButton } from "@/components/ui/pdf-export-button";
import SaveCalcButton from "@/components/SaveCalcButton";
import { useCalculationReload } from "@/hooks/useCalculationReload";

type Resultado = {
  valorHora: number;
  valorHoraHE50: number;
  valorHoraHE100: number;
  totalHE50: number;
  totalHE100: number;
  totalHE: number;
  dsr?: number;
  totalComDSR?: number;
  salario: number;
  percentualExtra: number;
};

type Props = {
  /** Dados de contexto para telemetria/embeds */
  cargo?: string;
  uf?: string;
  showShareButtons?: boolean;
  showAds?: boolean;
  suppressUsageUi?: boolean; // mantido para compat
};

export default function HorasExtrasCalculator({
  cargo,
  uf,
  showShareButtons = false,
  showAds = true,
  suppressUsageUi = true,
}: Props) {
  const { toast } = useToast();

  // Gate global unificado
  const { isPro, remaining, allowOrRedirect, incrementCount } = useUsageLimit();
  const overLimit = !isPro && (remaining ?? 0) <= 0;

  // Inputs
  const [salario, setSalario] = useState<number | undefined>();
  const [jornadaMensal, setJornadaMensal] = useState<number | undefined>(220);

  const [horas50, setHoras50] = useState<number | undefined>(0);
  const [horas100, setHoras100] = useState<number | undefined>(0);

  // Adicionais personalizáveis (permite 60%, 70%, etc.)
  const [adicional50, setAdicional50] = useState<number | undefined>(50);
  const [adicional100, setAdicional100] = useState<number | undefined>(100);

  // Parâmetros para DSR (opcional)
  const [diasTrabalhados, setDiasTrabalhados] = useState<number | undefined>();
  const [diasDescanso, setDiasDescanso] = useState<number | undefined>();

  const [resultado, setResultado] = useState<Resultado | null>(null);

  // Hook para recarregar dados salvos
  useCalculationReload((inputs) => {
    if (inputs.salario !== undefined) setSalario(inputs.salario);
    if (inputs.jornadaMensal !== undefined) setJornadaMensal(inputs.jornadaMensal);
    if (inputs.horas50 !== undefined) setHoras50(inputs.horas50);
    if (inputs.horas100 !== undefined) setHoras100(inputs.horas100);
    if (inputs.adicional50 !== undefined) setAdicional50(inputs.adicional50);
    if (inputs.adicional100 !== undefined) setAdicional100(inputs.adicional100);
    if (inputs.diasTrabalhados !== undefined) setDiasTrabalhados(inputs.diasTrabalhados);
    if (inputs.diasDescanso !== undefined) setDiasDescanso(inputs.diasDescanso);
  }, setResultado);

  const canCalc =
    !!salario && salario > 0 &&
    !!jornadaMensal && jornadaMensal > 0 &&
    (horas50 ?? 0) >= 0 &&
    (horas100 ?? 0) >= 0 &&
    (adicional50 ?? 50) >= 0 &&
    (adicional100 ?? 100) >= 0;

  function calcularInterno(): Resultado | null {
    if (!canCalc) return null;

    const j = Math.max(1, jornadaMensal ?? 220);
    const baseHora = (salario ?? 0) / j;

    const add50 = Math.max(0, adicional50 ?? 50);
    const add100 = Math.max(0, adicional100 ?? 100);

    const h50 = Math.max(0, horas50 ?? 0);
    const h100 = Math.max(0, horas100 ?? 0);

    const valorHoraHE50 = baseHora * (1 + add50 / 100);
    const valorHoraHE100 = baseHora * (1 + add100 / 100);

    const totalHE50 = valorHoraHE50 * h50;
    const totalHE100 = valorHoraHE100 * h100;
    const totalHE = totalHE50 + totalHE100;

    const sal = salario ?? 0;
    const percentualExtra = sal > 0 ? (totalHE / sal) * 100 : 0;

    let dsr: number | undefined;
    let totalComDSR: number | undefined;

    const temDSRParams = (diasTrabalhados ?? 0) > 0 && (diasDescanso ?? 0) >= 0;
    if (temDSRParams) {
      // DSR sobre horas extras (critério prático usual)
      // DSR = (Valor HE ÷ dias trabalhados) × dias de descanso
      dsr = (totalHE / (diasTrabalhados as number)) * (diasDescanso as number);
      totalComDSR = totalHE + dsr;
    }

    return {
      valorHora: baseHora,
      valorHoraHE50,
      valorHoraHE100,
      totalHE50,
      totalHE100,
      totalHE,
      dsr,
      totalComDSR,
      salario: sal,
      percentualExtra,
    };
  }

  const handleCalcular = async () => {
    if (!canCalc) {
      toast({
        title: "Campos inválidos",
        description: "Preencha salário, jornada e quantidades corretamente.",
      });
      return;
    }

    // Gate de uso: redireciona para PRO se necessário
    const ok = await allowOrRedirect();
    if (!ok) return;

    const r = calcularInterno();
    if (!r) return;

    setResultado(r);

    // Incrementa contagem de uso (somente não-PRO)
    await incrementCount();

    // Telemetria opcional
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "calculate_horas_extras", {
        cargo: cargo || "unknown",
        uf: uf || "unknown",
      });
    }
  };

  const handleClear = () => {
    setSalario(undefined);
    setJornadaMensal(220);
    setHoras50(0);
    setHoras100(0);
    setAdicional50(50);
    setAdicional100(100);
    setDiasTrabalhados(undefined);
    setDiasDescanso(undefined);
    setResultado(null);
  };

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
          <Notice variant="info">
            Personalize os adicionais (ex.: 60%, 70%) e calcule opcionalmente o DSR sobre as horas extras.
          </Notice>

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
              <Label htmlFor="jornada">Jornada mensal (h)</Label>
              <NumberInput
                id="jornada"
                value={jornadaMensal}
                onChange={setJornadaMensal}
                min={1}
                placeholder="220"
              />
              <p className="text-xs text-muted-foreground">Padrão: 220h (44h/semana)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horas-50">Horas extras — adicional “50%”</Label>
              <NumberInput
                id="horas-50"
                value={horas50}
                onChange={setHoras50}
                min={0}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adicional-50">Adicional p/ grupo acima (%)</Label>
              <NumberInput
                id="adicional-50"
                value={adicional50}
                onChange={setAdicional50}
                min={0}
                max={300}
                suffix="%"
                placeholder="50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horas-100">Horas extras — adicional “100%”</Label>
              <NumberInput
                id="horas-100"
                value={horas100}
                onChange={setHoras100}
                min={0}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">Domingos/feriados, salvo regra coletiva</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adicional-100">Adicional p/ grupo acima (%)</Label>
              <NumberInput
                id="adicional-100"
                value={adicional100}
                onChange={setAdicional100}
                min={0}
                max={400}
                suffix="%"
                placeholder="100"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dias-trab">Dias trabalhados no período (opcional p/ DSR)</Label>
              <NumberInput
                id="dias-trab"
                value={diasTrabalhados}
                onChange={setDiasTrabalhados}
                min={1}
                placeholder="22"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dias-desc">Dias de descanso (domingos + feriados)</Label>
              <NumberInput
                id="dias-desc"
                value={diasDescanso}
                onChange={setDiasDescanso}
                min={0}
                placeholder="8"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCalcular} disabled={!canCalc || overLimit} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              {overLimit ? "Limite atingido" : "Calcular"}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <RotateCcw className="w-4 h-4" />
              Limpar
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
                <div className="text-2xl font-bold">{formatBRL(resultado.valorHora)}</div>
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
                  {formatBRL(resultado.totalHE)}
                </div>
                <p className="text-sm text-muted-foreground">
                  +{resultado.percentualExtra.toFixed(1)}% do salário
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Grupo 1 — adicional {formatPercent((adicional50 ?? 50) / 100)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valor hora:</span>
                    <span className="font-medium">{formatBRL(resultado.valorHoraHE50)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quantidade:</span>
                    <span className="font-medium">{(horas50 ?? 0)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <span className="font-bold text-primary">{formatBRL(resultado.totalHE50)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Grupo 2 — adicional {formatPercent((adicional100 ?? 100) / 100)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valor hora:</span>
                    <span className="font-medium">{formatBRL(resultado.valorHoraHE100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quantidade:</span>
                    <span className="font-medium">{(horas100 ?? 0)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <span className="font-bold text-primary">{formatBRL(resultado.totalHE100)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* DSR (se informado) */}
          {typeof resultado.dsr === "number" && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  DSR sobre Horas Extras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">DSR calculado:</span>
                    <span className="font-semibold text-primary">{formatBRL(resultado.dsr)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total horas extras + DSR:</span>
                    <span className="font-bold text-primary">{formatBRL(resultado.totalComDSR ?? (resultado.totalHE))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Como Calculamos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
                  <div>
                    <p className="font-medium">Valor da hora normal</p>
                    <p className="text-sm text-muted-foreground">
                      Salário ÷ jornada mensal = {formatBRL(resultado.valorHora)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <p className="font-medium">Valor da hora extra</p>
                    <p className="text-sm text-muted-foreground">
                      Hora extra = Hora normal × (1 + adicional%) — calculamos separadamente para cada grupo.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <p className="font-medium">Total de horas extras</p>
                    <p className="text-sm text-muted-foreground">
                      Soma de (valor hora extra × quantidade) de cada grupo.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">4</div>
                  <div>
                    <p className="font-medium">DSR (opcional)</p>
                    <p className="text-sm text-muted-foreground">
                      DSR = (Total HE ÷ dias trabalhados) × dias de descanso (se informados).
                    </p>
                  </div>
                </div>
              </div>
              <Notice variant="warning">
                <strong>Atenção:</strong> Convenções/ACPs podem definir percentuais diferentes (ex.: 60%, 70%). Ajuste os campos de adicional conforme a sua regra.
              </Notice>
            </CardContent>
          </Card>

          {/* Área dos botões: Logo, Salvar, Exportar PDF */}
          <div className="flex justify-center">
            <PDFExportButton
              calculatorName="Calculadora de Horas Extras"
              results={[
                { label: "Salário Mensal", value: formatBRL(resultado.salario) },
                { label: "Valor da Hora Normal", value: formatBRL(resultado.valorHora) },
                { label: "Valor Hora Extra (Grupo 1)", value: formatBRL(resultado.valorHoraHE50) },
                { label: "Total Grupo 1", value: formatBRL(resultado.totalHE50) },
                { label: "Valor Hora Extra (Grupo 2)", value: formatBRL(resultado.valorHoraHE100) },
                { label: "Total Grupo 2", value: formatBRL(resultado.totalHE100) },
                { label: "Total Horas Extras", value: formatBRL(resultado.totalHE) },
                { label: "Percentual sobre Salário", value: `${resultado.percentualExtra.toFixed(1)}%` },
                ...(resultado.dsr !== undefined ? [
                  { label: "DSR sobre HE", value: formatBRL(resultado.dsr) },
                  { label: "Total com DSR", value: formatBRL(resultado.totalComDSR ?? 0) },
                ] : [])
              ]}
              calculator="horas_extras"
              calculationType="horas_extras"
              input={{
                salario,
                jornadaMensal,
                horas50,
                horas100,
                adicional50,
                adicional100,
                diasTrabalhados,
                diasDescanso
              }}
              resultData={resultado}
            />
          </div>
        </div>
      )}
    </div>
  );
}
