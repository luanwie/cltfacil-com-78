import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Input } from "@/components/ui/input";
import Notice from "@/components/ui/notice";
import { Separator } from "@/components/ui/separator";
import { Calculator, DollarSign, Clock, Calendar as CalendarIcon, Settings2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { PDFExportButton } from "@/components/ui/pdf-export-button";

type ModoDias = "manual" | "automatico";

interface DSRData {
  salario: number;          // salário base mensal
  horasExtras: number;      // quantidade de horas extras no período
  adicionalHE: number;      // % adicional da hora extra (ex.: 50)
  jornadaMensal: number;    // total de horas mensais para calcular valor-hora (ex.: 220)
  // Manual:
  diasTrabalhados: number;  // dias trabalhados no período
  diasDescanso: number;     // domingos/feriados (e sábados se não trabalha sábado)
  // Automático:
  modoDias: ModoDias;
  ano: number | undefined;
  mes: number | undefined;          // 1..12
  feriadosNoMes: number;            // informado pelo usuário (nacional/estadual/municipal)
  trabalhaSabado: boolean;          // se não trabalha sábado, sábado entra como descanso
  faltasInjustificadas: number;     // reduzem dias trabalhados (impactam o DSR)
}

interface DSRResult {
  valorHora: number;
  valorHoraExtra: number;
  valorHorasExtras: number;
  dsr: number;
  total: number;
  diasTrabalhados: number;
  diasDescanso: number;
  detalhesDias?: string;
}

function countDaysInMonth(year: number, month1to12: number) {
  return new Date(year, month1to12, 0).getDate();
}

function countDayOfWeekInMonth(year: number, month1to12: number, weekday: number) {
  // weekday: 0=Domingo ... 6=Sábado
  let count = 0;
  const days = countDaysInMonth(year, month1to12);
  for (let d = 1; d <= days; d++) {
    const wd = new Date(year, month1to12 - 1, d).getDay();
    if (wd === weekday) count++;
  }
  return count;
}

const DSRCalculator = () => {
  const { toast } = useToast();

  // Gate global (4 grátis, PRO ilimitado)
  const { isPro, remaining, allowOrRedirect, incrementCount } = useUsageLimit();
  const overLimit = !isPro && (remaining ?? 0) <= 0;

  const [data, setData] = useState<DSRData>({
    salario: 0,
    horasExtras: 0,
    adicionalHE: 50,
    jornadaMensal: 220,

    diasTrabalhados: 0,
    diasDescanso: 0,

    modoDias: "manual",
    ano: undefined,
    mes: undefined,
    feriadosNoMes: 0,
    trabalhaSabado: true,
    faltasInjustificadas: 0,
  });

  const [result, setResult] = useState<DSRResult | null>(null);
  const countingRef = useRef(false); // evita descontar 2x no mesmo clique

  const update = <K extends keyof DSRData>(field: K, value: DSRData[K]) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const tryNumber = (v: number | undefined, fallback = 0) =>
    typeof v === "number" && !Number.isNaN(v) ? v : fallback;

  const calcularDiasAutomatico = () => {
    const ano = tryNumber(data.ano, NaN);
    const mes = tryNumber(data.mes, NaN); // 1..12
    if (!ano || !mes || ano < 1900 || mes < 1 || mes > 12) return null;

    const totalDias = countDaysInMonth(ano, mes);
    const domingos = countDayOfWeekInMonth(ano, mes, 0);
    const sabados = countDayOfWeekInMonth(ano, mes, 6);

    const feriados = Math.max(0, Math.trunc(data.feriadosNoMes));
    const faltas = Math.max(0, Math.trunc(data.faltasInjustificadas));

    // Descanso:
    // - Domingos sempre contam como descanso.
    // - Se NÃO trabalha sábado, sábados também entram como descanso.
    // - Feriados entram como descanso.
    const sabadoDescanso = data.trabalhaSabado ? 0 : sabados;
    const diasDescanso = Math.max(0, domingos + sabadoDescanso + feriados);

    // Dias trabalhados = dias corridos − descanso − faltas injustificadas
    const diasTrabalhados = Math.max(0, totalDias - diasDescanso - faltas);

    return {
      diasTrabalhados,
      diasDescanso,
      detalhes: `Mês ${String(mes).padStart(2, "0")}/${ano}: ${totalDias} dias, ${domingos} domingos, ${sabados} sábados, ${feriados} feriados, ${faltas} faltas injustificadas. ${data.trabalhaSabado ? "Trabalha sábado" : "Não trabalha sábado"}.`,
    };
  };

  const calculateInternal = (): DSRResult | null => {
    const salario = Number(data.salario);
    const he = Number(data.horasExtras);
    const add = Number(data.adicionalHE);
    const jornada = Number(data.jornadaMensal);

    if (salario <= 0 || he <= 0 || jornada <= 0) return null;

    // Determina dias trabalhados/descanso conforme modo
    let diasTrab = Number(data.diasTrabalhados);
    let diasDesc = Number(data.diasDescanso);
    let detalhesDias: string | undefined;

    if (data.modoDias === "automatico") {
      const auto = calcularDiasAutomatico();
      if (!auto) return null;
      diasTrab = auto.diasTrabalhados;
      diasDesc = auto.diasDescanso;
      detalhesDias = auto.detalhes;
    }

    if (diasTrab <= 0) return null;

    // Valor hora e HE
    const valorHora = salario / jornada;
    const valorHoraExtra = valorHora * (1 + add / 100);
    const valorHorasExtras = valorHoraExtra * he;

    // Súmula 172/TST: DSR sobre HE = (valor HE / dias trabalhados) × dias de descanso
    const dsr = (valorHorasExtras / diasTrab) * Math.max(0, diasDesc);
    const total = valorHorasExtras + dsr;

    return {
      valorHora,
      valorHoraExtra,
      valorHorasExtras,
      dsr,
      total,
      diasTrabalhados: diasTrab,
      diasDescanso: Math.max(0, diasDesc),
      detalhesDias,
    };
  };

  async function calculateDSR() {
    // Gate global (redireciona se estourou)
    const ok = await allowOrRedirect();
    if (!ok) return;

    const res = calculateInternal();
    if (!res) {
      toast({
        title: "Preencha os campos obrigatórios",
        description:
          data.modoDias === "manual"
            ? "Informe salário, horas extras, jornada, dias trabalhados e dias de descanso."
            : "Informe salário, horas extras, jornada, ano, mês e demais campos para o modo automático.",
      });
      return;
    }

    setResult(res);

    // incrementa uso só após cálculo OK
    if (!countingRef.current) {
      countingRef.current = true;
      try {
        await incrementCount();
      } finally {
        setTimeout(() => (countingRef.current = false), 200);
      }
    }
  }

  const clearForm = () => {
    setData({
      salario: 0,
      horasExtras: 0,
      adicionalHE: 50,
      jornadaMensal: 220,
      diasTrabalhados: 0,
      diasDescanso: 0,
      modoDias: "manual",
      ano: undefined,
      mes: undefined,
      feriadosNoMes: 0,
      trabalhaSabado: true,
      faltasInjustificadas: 0,
    });
    setResult(null);
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const canCalcManual =
    data.salario > 0 &&
    data.horasExtras > 0 &&
    data.jornadaMensal > 0 &&
    data.diasTrabalhados > 0;

  const canCalcAuto =
    data.salario > 0 &&
    data.horasExtras > 0 &&
    data.jornadaMensal > 0 &&
    !!data.ano &&
    !!data.mes;

  const isValid =
    (data.modoDias === "manual" ? canCalcManual : canCalcAuto) && !overLimit;

  return (
    <div className="space-y-6">
      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora de DSR (Descanso Semanal Remunerado)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Notice variant="info">
            O DSR sobre horas extras é calculado pela fórmula da Súmula 172 do TST:
            <br />
            <strong>DSR = (Valor das HEs ÷ dias trabalhados) × dias de descanso</strong>.
          </Notice>

          {/* Básico */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salario">Salário base mensal (R$)</Label>
              <NumberInput
                id="salario"
                prefix="R$"
                decimal
                value={data.salario}
                onChange={(v) => update("salario", v || 0)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jornada">Jornada mensal (h)</Label>
              <NumberInput
                id="jornada"
                suffix="h"
                value={data.jornadaMensal}
                onChange={(v) => update("jornadaMensal", v || 0)}
                placeholder="220"
              />
              <p className="text-xs text-muted-foreground">
                Valor-hora = salário ÷ jornada mensal.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horasExtras">Horas extras no período (h)</Label>
              <NumberInput
                id="horasExtras"
                decimal
                value={data.horasExtras}
                onChange={(v) => update("horasExtras", v || 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adicionalHE">Adicional da hora extra (%)</Label>
              <NumberInput
                id="adicionalHE"
                suffix="%"
                value={data.adicionalHE}
                onChange={(v) => update("adicionalHE", v || 0)}
                placeholder="50"
              />
              <p className="text-xs text-muted-foreground">
                Exemplos comuns: 50% (dias úteis), 100% (domingos/feriados). Verifique sua CCT.
              </p>
            </div>
          </div>

          <Separator />

          {/* Modo de cálculo dos dias */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Modo de apuração dos dias
            </Label>
            <div className="flex gap-2">
              <Button
                variant={data.modoDias === "manual" ? "default" : "outline"}
                onClick={() => update("modoDias", "manual")}
              >
                Manual
              </Button>
              <Button
                variant={data.modoDias === "automatico" ? "default" : "outline"}
                onClick={() => update("modoDias", "automatico")}
              >
                Automático (mês/ano)
              </Button>
            </div>
          </div>

          {data.modoDias === "manual" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diasTrab">Dias trabalhados no período</Label>
                <NumberInput
                  id="diasTrab"
                  value={data.diasTrabalhados}
                  onChange={(v) => update("diasTrabalhados", v || 0)}
                  placeholder="22"
                />
                <p className="text-xs text-muted-foreground">Dias úteis realmente trabalhados (descontadas faltas injustificadas).</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diasDesc">Dias de descanso no período</Label>
                <NumberInput
                  id="diasDesc"
                  value={data.diasDescanso}
                  onChange={(v) => update("diasDescanso", v || 0)}
                  placeholder="8"
                />
                <p className="text-xs text-muted-foreground">Domingos e feriados (e, opcionalmente, sábados se não houver trabalho aos sábados).</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ano">Ano</Label>
                <NumberInput
                  id="ano"
                  value={data.ano}
                  onChange={(v) => update("ano", v)}
                  placeholder="2025"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mes">Mês</Label>
                <NumberInput
                  id="mes"
                  value={data.mes}
                  onChange={(v) => update("mes", v)}
                  min={1}
                  max={12}
                  placeholder="1..12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feriados">Feriados no mês</Label>
                <NumberInput
                  id="feriados"
                  value={data.feriadosNoMes}
                  onChange={(v) => update("feriadosNoMes", v || 0)}
                  min={0}
                  max={10}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trabalhaSabado">Trabalha aos sábados?</Label>
                <select
                  id="trabalhaSabado"
                  className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                  value={data.trabalhaSabado ? "sim" : "nao"}
                  onChange={(e) => update("trabalhaSabado", e.target.value === "sim")}
                >
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="faltas">Faltas injustificadas no mês</Label>
                <NumberInput
                  id="faltas"
                  value={data.faltasInjustificadas}
                  onChange={(v) => update("faltasInjustificadas", v || 0)}
                  min={0}
                  max={31}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Observação
                </Label>
                <p className="text-xs text-muted-foreground">
                  O modo automático estima <em>domingos</em>, <em>sábados</em> e usa os <em>feriados</em> informados.
                  Ele reduz os <em>dias trabalhados</em> por <em>faltas injustificadas</em>. Ajuste se sua jornada/escala for diferente.
                </p>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={calculateDSR}
              disabled={!isValid}
              className="flex-1 min-w-[160px]"
            >
              <Calculator className="mr-2 h-4 w-4" />
              {overLimit ? "Limite atingido" : "Calcular DSR"}
            </Button>

            <Button
              variant="outline"
              onClick={clearForm}
              className="flex-1 min-w-[120px]"
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Valor da Hora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {formatCurrency(result.valorHora)}
              </p>
              <p className="text-xs text-muted-foreground">Salário ÷ jornada mensal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Horas Extras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Valor hora extra</p>
                <p className="font-medium">
                  {formatCurrency(result.valorHoraExtra)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total horas extras
                </p>
                <p className="text-lg font-semibold">
                  {formatCurrency(result.valorHorasExtras)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-primary">
                <CalendarIcon className="h-4 w-4" />
                DSR sobre HEs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(result.dsr)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (HE ÷ {result.diasTrabalhados} dias trab.) × {result.diasDescanso} dias descanso
              </p>
              {result.detalhesDias && (
                <div className="mt-3 p-2 border rounded bg-background text-xs">
                  {result.detalhesDias}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-400">
                <DollarSign className="h-4 w-4" />
                Total a Receber
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1">
                Horas extras + DSR
              </p>
              <p className="text-xl font-bold text-green-700 dark:text-green-400">
                {formatCurrency(result.total)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Como Calculamos */}
      <Card>
        <CardHeader>
          <CardTitle>Como Calculamos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Valor da hora</p>
                <p className="text-sm text-muted-foreground">Salário ÷ jornada mensal.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Valor da hora extra</p>
                <p className="text-sm text-muted-foreground">Valor hora × (1 + adicional%).</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">DSR sobre horas extras</p>
                <p className="text-sm text-muted-foreground">
                  DSR = (Valor das HEs ÷ dias trabalhados) × dias de descanso (Súmula 172/TST).
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-medium">
                !
              </div>
              <div>
                <p className="font-medium">Atenções</p>
                <p className="text-sm text-muted-foreground">
                  Faltas injustificadas reduzem dias trabalhados e impactam o DSR. Normas coletivas e escalas
                  específicas (12x36, etc.) podem alterar a apuração de dias. Ajuste os campos conforme sua realidade.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Exportar PDF */}
      {result && (
        <div className="flex justify-center">
          <PDFExportButton
            calculatorName="Calculadora de DSR (Horas Extras)"
            results={[
              { label: "Valor da Hora", value: formatCurrency(result.valorHora) },
              { label: "Valor da Hora Extra", value: formatCurrency(result.valorHoraExtra) },
              { label: "Valor das Horas Extras", value: formatCurrency(result.valorHorasExtras) },
              { label: "Valor do DSR", value: formatCurrency(result.dsr) },
              { label: "Total (HE + DSR)", value: formatCurrency(result.total) },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default DSRCalculator;
