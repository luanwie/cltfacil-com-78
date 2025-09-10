import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, RotateCcw, DollarSign, AlertTriangle, Clock } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/currency";

import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useToast } from "@/hooks/use-toast";
import { PDFExportButton } from "@/components/ui/pdf-export-button";
import SaveCalcButton from "@/components/SaveCalcButton";

type Resultado = {
  baseUsadaNum: number;
  baseCalculoTipo: "Salário Mínimo" | "Salário Contratual";
  grauPercentualNum: number;
  adicionalNum: number;
  salarioBaseNum: number;
  salarioTotalNum: number;
  aumentoPercentualNum: number;
  valorHoraAdicional?: number;
  valorDiaAdicional?: number;
  fgtsSobreAdicional?: number;
};

const DEFAULT_MINIMO_2025 = 1412.0;

const InsalubridadeCalculator = () => {
  const { isPro, remaining, allowOrRedirect, incrementCount } = useUsageLimit();
  const { toast } = useToast();
  const overLimit = !isPro && (remaining ?? 0) <= 0;

  // ---- Form state ----
  const [salario, setSalario] = useState<number | undefined>();
  const [baseCalculo, setBaseCalculo] = useState<"minimo" | "contratual">("minimo");

  const [salarioMinimo, setSalarioMinimo] = useState<number | undefined>(DEFAULT_MINIMO_2025);
  const [grauPreset, setGrauPreset] = useState<"10" | "20" | "40" | "custom">("20");
  const [grauCustom, setGrauCustom] = useState<number | undefined>(undefined);

  const [considerarFGTS, setConsiderarFGTS] = useState<boolean>(true);
  const [jornadaMensal, setJornadaMensal] = useState<number | undefined>(220);
  const [exibirValorHoraDia, setExibirValorHoraDia] = useState<boolean>(true);

  // Proporcionalidade por dias do mês (ex.: admissão/desligamento)
  const [usarProporcional, setUsarProporcional] = useState<boolean>(false);
  const [diasConsiderados, setDiasConsiderados] = useState<number | undefined>(30);

  // EPI neutraliza (quando laudo técnico assim determina)
  const [epiNeutraliza, setEpiNeutraliza] = useState<boolean>(false);

  // ---- Resultado ----
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const grauPercent = (() => {
    if (epiNeutraliza) return 0;
    if (grauPreset === "custom") return Math.max(0, grauCustom ?? 0);
    return parseInt(grauPreset, 10);
  })();

  const baseUsadaNum =
    baseCalculo === "minimo"
      ? Math.max(0, salarioMinimo ?? 0)
      : Math.max(0, salario ?? 0);

  const salarioBaseNum = Math.max(0, salario ?? 0);

  const canSubmit =
    (baseCalculo === "minimo" ? (salarioMinimo ?? 0) > 0 : (salario ?? 0) > 0) &&
    grauPercent >= 0 &&
    !overLimit;

  const calcular = async () => {
    if (!canSubmit) return;
    
    if (!(await allowOrRedirect())) return;

    // Proporcionalidade
    const proporcao =
      usarProporcional && (diasConsiderados ?? 30) > 0
        ? Math.min(30, Math.max(0, diasConsiderados ?? 30)) / 30
        : 1;

    const adicionalNum = (baseUsadaNum * (grauPercent / 100)) * proporcao;
    const salarioTotalNum = salarioBaseNum + adicionalNum;
    const aumentoPercentualNum = salarioBaseNum > 0 ? adicionalNum / salarioBaseNum : 0;

    // Valor hora/dia do adicional (opcional)
    let valorHoraAdicional: number | undefined;
    let valorDiaAdicional: number | undefined;
    if (exibirValorHoraDia) {
      const j = Math.max(1, jornadaMensal ?? 220);
      valorHoraAdicional = adicionalNum / j;
      valorDiaAdicional = adicionalNum / 30;
    }

    // Reflexo de FGTS (8%) sobre o adicional (estimativa mensal)
    const fgtsSobreAdicional = considerarFGTS ? adicionalNum * 0.08 : undefined;

    // Desconta 1 uso global (se não for PRO)
    await incrementCount();

    setResultado({
      baseUsadaNum,
      baseCalculoTipo: baseCalculo === "minimo" ? "Salário Mínimo" : "Salário Contratual",
      grauPercentualNum: grauPercent / 100,
      adicionalNum,
      salarioBaseNum,
      salarioTotalNum,
      aumentoPercentualNum,
      valorHoraAdicional,
      valorDiaAdicional,
      fgtsSobreAdicional,
    });
  };

  const limpar = () => {
    setSalario(undefined);
    setBaseCalculo("minimo");
    setSalarioMinimo(DEFAULT_MINIMO_2025);
    setGrauPreset("20");
    setGrauCustom(undefined);
    setConsiderarFGTS(true);
    setJornadaMensal(220);
    setExibirValorHoraDia(true);
    setUsarProporcional(false);
    setDiasConsiderados(30);
    setEpiNeutraliza(false);
    setResultado(null);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo de Insalubridade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Base de cálculo */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="base-calculo">Base de cálculo</Label>
              <Select value={baseCalculo} onValueChange={(v: "minimo" | "contratual") => setBaseCalculo(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimo">Salário Mínimo</SelectItem>
                  <SelectItem value="contratual">Salário Contratual</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Verifique sua CCT/ACT. Por padrão jurisprudencial, aplica-se o salário mínimo,
                salvo previsão coletiva diversa.
              </p>
            </div>

            {baseCalculo === "minimo" ? (
              <div className="space-y-2">
                <Label htmlFor="salario-minimo">Salário mínimo (editável)</Label>
                <NumberInput
                  id="salario-minimo"
                  value={salarioMinimo}
                  onChange={setSalarioMinimo}
                  prefix="R$"
                  decimal
                  min={0}
                  placeholder={DEFAULT_MINIMO_2025.toFixed(2).replace(".", ",")}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="salario">Salário contratual (R$)</Label>
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
            )}

            {/* Grau */}
            <div className="space-y-2">
              <Label htmlFor="grau">Grau de insalubridade</Label>
              <Select
                value={grauPreset}
                onValueChange={(v: "10" | "20" | "40" | "custom") => setGrauPreset(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Mínimo (10%)</SelectItem>
                  <SelectItem value="20">Médio (20%)</SelectItem>
                  <SelectItem value="40">Máximo (40%)</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
              {grauPreset === "custom" && (
                <div className="mt-2">
                  <NumberInput
                    value={grauCustom}
                    onChange={setGrauCustom}
                    suffix="%"
                    min={0}
                    max={100}
                    placeholder="Ex.: 15"
                  />
                  <p className="text-xs text-muted-foreground">Use se sua CCT/ACT tiver percentual próprio.</p>
                </div>
              )}
            </div>

            {/* EPI neutraliza */}
            <div className="space-y-2">
              <Label>Laudo indica EPI neutraliza?</Label>
              <div className="flex items-center gap-3">
                <Switch checked={epiNeutraliza} onCheckedChange={setEpiNeutraliza} />
                <span className="text-sm">{epiNeutraliza ? "Sim (zera adicional)" : "Não"}</span>
              </div>
            </div>

            {/* Proporcionalidade */}
            <div className="space-y-2">
              <Label>Proporcional por dias no mês</Label>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="prop"
                  checked={usarProporcional}
                  onCheckedChange={(c) => setUsarProporcional(!!c)}
                />
                <Label htmlFor="prop" className="text-sm">Aplicar proporcionalidade (admissão/desligamento)</Label>
              </div>
              {usarProporcional && (
                <div className="mt-2">
                  <NumberInput
                    value={diasConsiderados}
                    onChange={setDiasConsiderados}
                    min={0}
                    max={30}
                    placeholder="30"
                  />
                  <p className="text-xs text-muted-foreground">Dias considerados no mês (0–30).</p>
                </div>
              )}
            </div>

            {/* Jornada/FGTS/Detalhes */}
            <div className="space-y-2">
              <Label>Opções</Label>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="fgts"
                  checked={considerarFGTS}
                  onCheckedChange={(c) => setConsiderarFGTS(!!c)}
                />
                <Label htmlFor="fgts" className="text-sm">Exibir FGTS (8%) sobre o adicional</Label>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Checkbox
                  id="hora-dia"
                  checked={exibirValorHoraDia}
                  onCheckedChange={(c) => setExibirValorHoraDia(!!c)}
                />
                <Label htmlFor="hora-dia" className="text-sm">Exibir valor-hora e valor-dia do adicional</Label>
              </div>
              {exibirValorHoraDia && (
                <div className="mt-2">
                  <NumberInput
                    value={jornadaMensal}
                    onChange={setJornadaMensal}
                    min={1}
                    placeholder="220"
                  />
                  <p className="text-xs text-muted-foreground">Jornada mensal (padrão: 220h).</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={calcular} disabled={!canSubmit} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              {overLimit ? "Limite atingido" : "Calcular Insalubridade"}
            </Button>
            <Button variant="outline" onClick={limpar}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {resultado && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Base de Cálculo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatBRL(resultado.baseUsadaNum)}</div>
                <p className="text-sm text-muted-foreground">{resultado.baseCalculoTipo}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Grau Aplicado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-orange-600">
                  {formatPercent(resultado.grauPercentualNum)}
                </div>
                <p className="text-sm text-muted-foreground">Conforme NR-15 / CCT</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Adicional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-primary">{formatBRL(resultado.adicionalNum)}</div>
                <p className="text-sm text-muted-foreground">
                  {formatPercent(resultado.grauPercentualNum)} da base
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Salário Total com Adicional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {formatBRL(resultado.salarioTotalNum)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Aumento de {formatPercent(resultado.aumentoPercentualNum)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Salário base:</span>
                      <span className="font-medium">{formatBRL(resultado.salarioBaseNum)}</span>
                    </div>
                    <div className="flex justify-between text-primary">
                      <span className="text-sm">Insalubridade:</span>
                      <span className="font-medium">+{formatBRL(resultado.adicionalNum)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span className="text-primary">{formatBRL(resultado.salarioTotalNum)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(resultado.fgtsSobreAdicional !== undefined ||
              resultado.valorHoraAdicional !== undefined ||
              resultado.valorDiaAdicional !== undefined) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Detalhamento (hora/dia & FGTS)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {resultado.valorHoraAdicional !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Adicional por hora:</span>
                      <span className="font-medium">{formatBRL(resultado.valorHoraAdicional)}</span>
                    </div>
                  )}
                  {resultado.valorDiaAdicional !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Adicional por dia (30):</span>
                      <span className="font-medium">{formatBRL(resultado.valorDiaAdicional)}</span>
                    </div>
                  )}
                  {resultado.fgtsSobreAdicional !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">FGTS (8%) sobre adicional:</span>
                      <span className="font-medium">{formatBRL(resultado.fgtsSobreAdicional)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

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
                    <p className="font-medium">Definição da Base</p>
                    <p className="text-sm text-muted-foreground">
                      {baseCalculo === "minimo" ? "Salário Mínimo" : "Salário Contratual"} = {formatBRL(baseUsadaNum)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Aplicação do Grau</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPercent(grauPercent / 100)} × {formatBRL(baseUsadaNum)}
                      {usarProporcional ? ` × (${Math.min(30, Math.max(0, diasConsiderados ?? 30))}/30)` : ""} = {formatBRL(resultado.adicionalNum)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Integração</p>
                    <p className="text-sm text-muted-foreground">
                      Salário total = salário base + adicional. (Mostramos também valor-hora/dia e FGTS, se selecionado.)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão Exportar PDF */}
          <div className="flex justify-center">
            <PDFExportButton
              calculatorName="Calculadora de Insalubridade"
              results={[
                { label: "Base de Cálculo", value: formatBRL(resultado.baseUsadaNum) },
                { label: "Tipo de Base", value: resultado.baseCalculoTipo },
                { label: "Grau Aplicado", value: formatPercent(resultado.grauPercentualNum) },
                { label: "Adicional de Insalubridade", value: formatBRL(resultado.adicionalNum) },
                { label: "Salário Base", value: formatBRL(resultado.salarioBaseNum) },
                { label: "Salário Total com Adicional", value: formatBRL(resultado.salarioTotalNum) },
                { label: "Aumento Percentual", value: formatPercent(resultado.aumentoPercentualNum) },
                ...(resultado.valorHoraAdicional !== undefined ? [
                  { label: "Adicional por Hora", value: formatBRL(resultado.valorHoraAdicional) },
                ] : []),
                ...(resultado.valorDiaAdicional !== undefined ? [
                  { label: "Adicional por Dia", value: formatBRL(resultado.valorDiaAdicional) },
                ] : []),
                ...(resultado.fgtsSobreAdicional !== undefined ? [
                  { label: "FGTS (8%) sobre Adicional", value: formatBRL(resultado.fgtsSobreAdicional) },
                ] : [])
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InsalubridadeCalculator;
