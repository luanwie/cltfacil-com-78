import { useRef, useState } from "react";
import { Calculator, RotateCcw, Calendar, DollarSign, Clock, Settings2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Notice from "@/components/ui/notice";
import { Separator } from "@/components/ui/separator";
import { formatBRL, formatPercent } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { PDFExportButton } from "@/components/ui/pdf-export-button";

type Mode = "manual" | "datas";

interface CalculationInputs {
  // comuns
  incluirTerco: boolean;
  arredondarDias: boolean;

  // manual
  salarioBase?: number;
  mediaVariaveis?: number;
  mesesTrabalhados?: number; // 0..12

  // por datas
  salarioBaseDatas?: number;
  mediaVariaveisDatas?: number;
  dataAdmissao?: string;     // yyyy-mm-dd
  dataDesligamento?: string; // yyyy-mm-dd
}

type Resultado = {
  baseRemuneracao: number;
  mesesValidos: number;
  diasFerias: number;
  valorFerias: number;
  valorTerco: number;
  totalReceber: number;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v || 0));

function countMonthsByFifteenDays(adm: Date, des: Date): number {
  // conta meses (0-12) com >=15 dias trabalhados entre adm e des (inclusive)
  if (des < adm) return 0;

  // Normaliza para início/fim do dia
  const start = new Date(adm.getFullYear(), adm.getMonth(), adm.getDate());
  const end = new Date(des.getFullYear(), des.getMonth(), des.getDate());

  let months = 0;
  // Itera mês a mês do início ao fim
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const monthStart = new Date(y, m, 1);
    const monthEnd = new Date(y, m + 1, 0); // último dia do mês

    // interseção entre [start,end] e [monthStart,monthEnd]
    const segStart = start > monthStart ? start : monthStart;
    const segEnd = end < monthEnd ? end : monthEnd;

    // dias no mês trabalhados (se intervalo válido)
    let days = 0;
    if (segEnd >= segStart) {
      // +1 porque ambos os limites contam
      days = Math.floor((segEnd.getTime() - segStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    if (days >= 15) months += 1;

    // próximo mês
    cursor = new Date(y, m + 1, 1);
  }

  return clamp(months, 0, 12);
}

export default function FeriasProporcionaisCalculator() {
  const { toast } = useToast();

  // Gate unificado
  const { isPro, remaining, allowOrRedirect, incrementCount } = useUsageLimit();
  const overLimit = !isPro && (remaining ?? 0) <= 0;

  const [mode, setMode] = useState<Mode>("manual");
  const [inputs, setInputs] = useState<CalculationInputs>({
    incluirTerco: true,
    arredondarDias: false,
    salarioBase: undefined,
    mediaVariaveis: undefined,
    mesesTrabalhados: undefined,
    salarioBaseDatas: undefined,
    mediaVariaveisDatas: undefined,
    dataAdmissao: "",
    dataDesligamento: "",
  });

  const [result, setResult] = useState<Resultado | null>(null);
  const countingRef = useRef(false);

  const computeManual = (): Resultado | null => {
    const salario = Number(inputs.salarioBase ?? 0);
    const media = Number(inputs.mediaVariaveis ?? 0);
    if (salario <= 0) return null;

    const meses = clamp(inputs.mesesTrabalhados ?? 0, 0, 12);
    const base = salario + media;

    const diasBrutos = meses * 2.5; // 30 / 12
    const diasFerias = inputs.arredondarDias ? Math.ceil(diasBrutos) : Math.floor(diasBrutos);

    const valorDiario = base / 30;
    const valorFerias = valorDiario * diasFerias;
    const valorTerco = inputs.incluirTerco ? valorFerias / 3 : 0;
    const totalReceber = valorFerias + valorTerco;

    return { baseRemuneracao: base, mesesValidos: meses, diasFerias, valorFerias, valorTerco, totalReceber };
  };

  const computeByDates = (): Resultado | null => {
    const salario = Number(inputs.salarioBaseDatas ?? 0);
    const media = Number(inputs.mediaVariaveisDatas ?? 0);
    if (salario <= 0) return null;
    if (!inputs.dataAdmissao || !inputs.dataDesligamento) return null;

    const adm = new Date(inputs.dataAdmissao);
    const des = new Date(inputs.dataDesligamento);
    if (isNaN(adm.getTime()) || isNaN(des.getTime())) return null;

    const meses = countMonthsByFifteenDays(adm, des);
    const base = salario + media;

    const diasBrutos = meses * 2.5;
    const diasFerias = inputs.arredondarDias ? Math.ceil(diasBrutos) : Math.floor(diasBrutos);

    const valorDiario = base / 30;
    const valorFerias = valorDiario * diasFerias;
    const valorTerco = inputs.incluirTerco ? valorFerias / 3 : 0;
    const totalReceber = valorFerias + valorTerco;

    return { baseRemuneracao: base, mesesValidos: meses, diasFerias, valorFerias, valorTerco, totalReceber };
  };

  const calcularInterno = (): Resultado | null => {
    return mode === "manual" ? computeManual() : computeByDates();
  };

  async function handleCalculate() {
    const ok = await allowOrRedirect();
    if (!ok) return;

    const r = calcularInterno();
    if (!r) {
      toast({
        title: "Campos inválidos",
        description:
          mode === "manual"
            ? "Informe salário (e opcionalmente a média) e meses entre 0 e 12."
            : "Informe salário (e opcionalmente a média) e datas válidas de admissão e desligamento.",
      });
      return;
    }

    setResult(r);

    if (!countingRef.current) {
      countingRef.current = true;
      try {
        await incrementCount();
      } finally {
        setTimeout(() => (countingRef.current = false), 200);
      }
    }
  }

  function handleClear() {
    setInputs({
      incluirTerco: true,
      arredondarDias: false,
      salarioBase: undefined,
      mediaVariaveis: undefined,
      mesesTrabalhados: undefined,
      salarioBaseDatas: undefined,
      mediaVariaveisDatas: undefined,
      dataAdmissao: "",
      dataDesligamento: "",
    });
    setResult(null);
  }

  const canCalculate =
    (!overLimit &&
      ((mode === "manual" && (inputs.salarioBase ?? 0) > 0 && (inputs.mesesTrabalhados ?? -1) >= 0 && (inputs.mesesTrabalhados ?? 13) <= 12) ||
        (mode === "datas" && (inputs.salarioBaseDatas ?? 0) > 0 && !!inputs.dataAdmissao && !!inputs.dataDesligamento)));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Calculadora de Férias Proporcionais
          </CardTitle>
          <CardDescription>
            Base com <strong>salário + média de variáveis</strong>. Use meses (0–12) ou calcule
            automaticamente pelas <strong>datas</strong> (regra dos 15 dias por mês).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Notice variant="info">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5" />
              <p>
                <strong>Regra dos 15 dias:</strong> se houver ao menos 15 dias trabalhados em um mês, conta 1/12 de férias. A base considera
                verbas habituais (comissões/HE/adicionais) via “média de variáveis”.
              </p>
            </div>
          </Notice>

          {/* Alternância de modo */}
          <div className="flex items-center gap-2">
            <Button variant={mode === "manual" ? "default" : "outline"} onClick={() => setMode("manual")}>
              Informar meses
            </Button>
            <Button variant={mode === "datas" ? "default" : "outline"} onClick={() => setMode("datas")}>
              Calcular pelas datas
            </Button>
          </div>

          {/* Formulários */}
          {mode === "manual" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salario">Salário base (R$)</Label>
                <NumberInput
                  id="salario"
                  prefix="R$"
                  decimal
                  placeholder="0,00"
                  value={inputs.salarioBase}
                  onChange={(value) => setInputs((p) => ({ ...p, salarioBase: value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="media">Média de variáveis (R$, opcional)</Label>
                <NumberInput
                  id="media"
                  prefix="R$"
                  decimal
                  placeholder="0,00"
                  value={inputs.mediaVariaveis}
                  onChange={(value) => setInputs((p) => ({ ...p, mediaVariaveis: value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meses">Meses trabalhados (0–12)</Label>
                <NumberInput
                  id="meses"
                  placeholder="0"
                  min={0}
                  max={12}
                  value={inputs.mesesTrabalhados}
                  onChange={(value) => setInputs((p) => ({ ...p, mesesTrabalhados: value }))}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="salarioDatas">Salário base (R$)</Label>
                <NumberInput
                  id="salarioDatas"
                  prefix="R$"
                  decimal
                  placeholder="0,00"
                  value={inputs.salarioBaseDatas}
                  onChange={(value) => setInputs((p) => ({ ...p, salarioBaseDatas: value }))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="mediaDatas">Média de variáveis (R$, opcional)</Label>
                <NumberInput
                  id="mediaDatas"
                  prefix="R$"
                  decimal
                  placeholder="0,00"
                  value={inputs.mediaVariaveisDatas}
                  onChange={(value) => setInputs((p) => ({ ...p, mediaVariaveisDatas: value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adm">Data de admissão</Label>
                <input
                  id="adm"
                  type="date"
                  value={inputs.dataAdmissao || ""}
                  onChange={(e) => setInputs((p) => ({ ...p, dataAdmissao: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desl">Data de desligamento</Label>
                <input
                  id="desl"
                  type="date"
                  value={inputs.dataDesligamento || ""}
                  onChange={(e) => setInputs((p) => ({ ...p, dataDesligamento: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terco"
                checked={inputs.incluirTerco}
                onCheckedChange={(checked) => setInputs((prev) => ({ ...prev, incluirTerco: !!checked }))}
              />
              <Label htmlFor="terco" className="text-sm font-normal">
                Incluir 1/3 constitucional
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="arredondar"
                checked={inputs.arredondarDias}
                onCheckedChange={(checked) => setInputs((prev) => ({ ...prev, arredondarDias: !!checked }))}
              />
              <Label htmlFor="arredondar" className="text-sm font-normal">
                Arredondar dias para cima
              </Label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleCalculate} disabled={!canCalculate} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              {overLimit ? "Limite atingido" : "Calcular"}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Resultado do Cálculo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Meses válidos (regra dos 15 dias)</p>
                  <p className="font-semibold">{result.mesesValidos}/12</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Dias de Férias Proporcionais</p>
                  <p className="font-semibold">{result.diasFerias} dias</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Base de Remuneração</p>
                  <p className="font-semibold">{formatBRL(result.baseRemuneracao)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-primary">Total a Receber</p>
                  <p className="font-bold text-lg text-primary">
                    {formatBRL(result.totalReceber)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded bg-background border">
                <div className="text-sm text-muted-foreground">Valor das Férias</div>
                <div className="text-xl font-semibold">{formatBRL(result.valorFerias)}</div>
              </div>
              <div className="p-3 rounded bg-background border">
                <div className="text-sm text-muted-foreground">1/3 Constitucional</div>
                <div className="text-xl font-semibold">
                  {inputs.incluirTerco ? formatBRL(result.valorTerco) : "Não incluído"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão Exportar PDF */}
      {result && (
        <div className="flex justify-center">
          <PDFExportButton
            calculatorName="Calculadora de Férias Proporcionais"
            results={[
              { label: "Base de Remuneração", value: formatBRL(result.baseRemuneracao) },
              { label: "Meses Válidos", value: `${result.mesesValidos}/12` },
              { label: "Dias de Férias", value: `${result.diasFerias} dias` },
              { label: "Valor das Férias", value: formatBRL(result.valorFerias) },
              { label: "1/3 Constitucional", value: inputs.incluirTerco ? formatBRL(result.valorTerco) : "Não incluído" },
              { label: "Total a Receber", value: formatBRL(result.totalReceber) },
            ]}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Como Calculamos as Férias Proporcionais?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">1</div>
              <div>
                <p className="font-medium">Meses válidos</p>
                <p className="text-sm text-muted-foreground">
                  Manual: você informa 0–12. Por datas: contamos 1/12 para cada mês com <strong>≥ 15 dias</strong> trabalhados.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">2</div>
              <div>
                <p className="font-medium">Dias proporcionais</p>
                <p className="text-sm text-muted-foreground">Dias = meses válidos × 2,5. Se marcado, arredondamos para cima.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">3</div>
              <div>
                <p className="font-medium">Base e valores</p>
                <p className="text-sm text-muted-foreground">
                  Base = salário + média de variáveis. Férias = (Base ÷ 30) × dias. 1/3 = Férias ÷ 3 (opcional).
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">4</div>
              <div>
                <p className="font-medium">Total</p>
                <p className="text-sm text-muted-foreground">Total = Férias + 1/3 (se incluído).</p>
              </div>
            </div>
          </div>

          <Notice variant="warning">
            <strong>Importante:</strong> Este cálculo é estimativo e não inclui descontos (INSS/IRRF) nem eventuais impactos de CCT/ACT
            sobre arredondamentos e médias. Em rescisões, confira as regras específicas do seu sindicato.
          </Notice>
        </CardContent>
      </Card>
    </div>
  );
}
