import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Input } from "@/components/ui/input";
import Notice from "@/components/ui/notice";
import { Separator } from "@/components/ui/separator";
import { Calculator, RotateCcw, DollarSign, Calendar as CalendarIcon, Settings2, CheckCircle } from "lucide-react";
import { formatBRL } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { PDFExportButton } from "@/components/ui/pdf-export-button";
import SaveCalcButton from "@/components/SaveCalcButton";

type ModoDias = "manual" | "automatico";

type Resultado = {
  comissoes: string;
  diasTrabalhados: number;
  diasDescanso: number;
  mediaDiaria: string;
  valorDSR: string;
  totalComDSR: string;
  percentualDSR: string;
  detalhesDias?: string;
};

function countDaysInMonth(year: number, month1to12: number) {
  return new Date(year, month1to12, 0).getDate();
}
function countDayOfWeekInMonth(year: number, month1to12: number, weekday: number) {
  // weekday: 0=Domingo ... 6=Sábado
  let count = 0;
  const days = countDaysInMonth(year, month1to12);
  for (let d = 1; d <= days; d++) {
    if (new Date(year, month1to12 - 1, d).getDay() === weekday) count++;
  }
  return count;
}

const DSRComissoesCalculator = () => {
  const { toast } = useToast();

  // Gate global (4 grátis; PRO ilimitado)
  const { isPro, remaining, allowOrRedirect, incrementCount } = useUsageLimit();
  const overLimit = !isPro && (remaining ?? 0) <= 0;

  const [modoDias, setModoDias] = useState<ModoDias>("manual");

  // Entradas básicas
  const [comissoes, setComissoes] = useState<number | undefined>();
  // Manual
  const [diasTrabalhados, setDiasTrabalhados] = useState<number | undefined>(22);
  const [diasDescanso, setDiasDescanso] = useState<number | undefined>(8);
  // Automático
  const [ano, setAno] = useState<number | undefined>();
  const [mes, setMes] = useState<number | undefined>(); // 1..12
  const [feriadosNoMes, setFeriadosNoMes] = useState<number | undefined>(0);
  const [trabalhaSabado, setTrabalhaSabado] = useState<boolean>(true);
  const [faltasInjustificadas, setFaltasInjustificadas] = useState<number | undefined>(0);

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const countingRef = useRef(false); // evita descontar 2x no mesmo clique

  const calcularDiasAutomatico = () => {
    const y = ano ?? 0;
    const m = mes ?? 0;
    if (y < 1900 || m < 1 || m > 12) return null;

    const totalDias = countDaysInMonth(y, m);
    const domingos = countDayOfWeekInMonth(y, m, 0);
    const sabados = countDayOfWeekInMonth(y, m, 6);

    const fer = Math.max(0, Math.trunc(feriadosNoMes ?? 0));
    const faltas = Math.max(0, Math.trunc(faltasInjustificadas ?? 0));
    const sabadoComoDescanso = trabalhaSabado ? 0 : sabados;

    const descanso = Math.max(0, domingos + sabadoComoDescanso + fer);
    const trabalhados = Math.max(0, totalDias - descanso - faltas);

    return {
      diasTrabalhados: trabalhados,
      diasDescanso: descanso,
      detalhes: `Mês ${String(m).padStart(2, "0")}/${y}: ${totalDias} dias, ${domingos} domingos, ${sabados} sábados, ${fer} feriados, ${faltas} faltas. ${trabalhaSabado ? "Trabalha" : "Não trabalha"} aos sábados.`,
    };
  };

  function calcularInterno(): Resultado | null {
    const com = Number(comissoes ?? 0);
    if (com <= 0) return null;

    let dt = Number(diasTrabalhados ?? 0);
    let dd = Number(diasDescanso ?? 0);
    let detalhesDias: string | undefined;

    if (modoDias === "automatico") {
      const auto = calcularDiasAutomatico();
      if (!auto) return null;
      dt = auto.diasTrabalhados;
      dd = auto.diasDescanso;
      detalhesDias = auto.detalhes;
    }

    if (dt <= 0) return null;
    dd = Math.max(0, dd);

    const mediaDiariaNum = com / dt;
    const valorDSRNum = mediaDiariaNum * dd;
    const totalComDSRNum = com + valorDSRNum;

    return {
      comissoes: formatBRL(com),
      diasTrabalhados: dt,
      diasDescanso: dd,
      mediaDiaria: formatBRL(mediaDiariaNum),
      valorDSR: formatBRL(valorDSRNum),
      totalComDSR: formatBRL(totalComDSRNum),
      percentualDSR: ((valorDSRNum / com) * 100).toFixed(1),
      detalhesDias,
    };
  }

  async function handleCalcular() {
    // Gate (redireciona para PRO conforme regra global)
    const ok = await allowOrRedirect();
    if (!ok) return;

    const res = calcularInterno();
    if (!res) {
      toast({
        title: "Preencha corretamente",
        description:
          modoDias === "manual"
            ? "Informe comissões (>0), dias trabalhados (>0) e dias de descanso."
            : "Informe comissões (>0), ano, mês e demais campos para apuração automática.",
      });
      return;
    }

    setResultado(res);

    // incrementa uso após cálculo OK
    if (!countingRef.current) {
      countingRef.current = true;
      try {
        await incrementCount();
      } finally {
        setTimeout(() => (countingRef.current = false), 200);
      }
    }
  }

  function limpar() {
    setModoDias("manual");
    setComissoes(undefined);
    setDiasTrabalhados(22);
    setDiasDescanso(8);
    setAno(undefined);
    setMes(undefined);
    setFeriadosNoMes(0);
    setTrabalhaSabado(true);
    setFaltasInjustificadas(0);
    setResultado(null);
  }

  const canCalcManual = !!comissoes && (comissoes as number) > 0 && !!diasTrabalhados && (diasTrabalhados as number) > 0;
  const canCalcAuto =
    !!comissoes && (comissoes as number) > 0 &&
    !!ano && !!mes &&
    (mes as number) >= 1 && (mes as number) <= 12;

  const botaoDisabled = overLimit || (modoDias === "manual" ? !canCalcManual : !canCalcAuto);

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo de DSR sobre Comissões
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Notice variant="info">
            O DSR sobre comissões é calculado por: <strong>(Comissões ÷ dias trabalhados) × dias de descanso</strong>.
            Dias de descanso incluem <em>domingos</em> e <em>feriados</em>; se você <em>não</em> trabalha aos sábados,
            eles também podem ser considerados descanso (conforme prática da empresa/CCT).
          </Notice>

          {/* Modo de apuração dos dias */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Modo de apuração dos dias
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={modoDias === "manual" ? "default" : "outline"}
                onClick={() => setModoDias("manual")}
              >
                Manual
              </Button>
              <Button
                type="button"
                variant={modoDias === "automatico" ? "default" : "outline"}
                onClick={() => setModoDias("automatico")}
              >
                Automático (mês/ano)
              </Button>
            </div>
          </div>

          {/* Entradas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

            {modoDias === "manual" ? (
              <>
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
                  <p className="text-xs text-muted-foreground">Dias úteis realmente trabalhados (descontando faltas injustificadas).</p>
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
                  <p className="text-xs text-muted-foreground">Domingos + feriados (e sábados, se não trabalha).</p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ano">Ano</Label>
                  <NumberInput id="ano" value={ano} onChange={setAno} placeholder="2025" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mes">Mês</Label>
                  <NumberInput id="mes" value={mes} onChange={setMes} min={1} max={12} placeholder="1..12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feriados">Feriados no mês</Label>
                  <NumberInput id="feriados" value={feriadosNoMes} onChange={setFeriadosNoMes} min={0} max={10} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trabalhaSabado">Trabalha aos sábados?</Label>
                  <select
                    id="trabalhaSabado"
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                    value={trabalhaSabado ? "sim" : "nao"}
                    onChange={(e) => setTrabalhaSabado(e.target.value === "sim")}
                  >
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faltas">Faltas injustificadas no mês</Label>
                  <NumberInput id="faltas" value={faltasInjustificadas} onChange={setFaltasInjustificadas} min={0} max={31} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Observação
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    O modo automático estima <em>domingos</em>, <em>sábados</em> (se não trabalha) e usa os <em>feriados</em> que você informar.
                    Reduz os <em>dias trabalhados</em> por <em>faltas injustificadas</em>.
                  </p>
                </div>
              </>
            )}
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button onClick={handleCalcular} disabled={botaoDisabled} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              {overLimit ? "Limite atingido" : "Calcular DSR"}
            </Button>
            <Button variant="outline" onClick={limpar}>
              <RotateCcw className="w-4 h-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultado */}
      {resultado && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Média Diária
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resultado.mediaDiaria}</div>
                <p className="text-sm text-muted-foreground">Comissões ÷ {resultado.diasTrabalhados} dias trabalhados</p>
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
                {resultado.detalhesDias && (
                  <div className="mt-3 p-2 border rounded bg-background text-xs">
                    {resultado.detalhesDias}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
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

      {/* Botão Exportar PDF */}
      {resultado && (
        <div className="flex justify-center">
          <PDFExportButton
            calculatorName="Calculadora de DSR (Comissões)"
            results={[
              { label: "Comissões", value: resultado.comissoes },
              { label: "Dias Trabalhados", value: `${resultado.diasTrabalhados} dias` },
              { label: "Dias de Descanso", value: `${resultado.diasDescanso} dias` },
              { label: "Média Diária", value: resultado.mediaDiaria },
              { label: "Valor do DSR", value: resultado.valorDSR },
              { label: "Total com DSR", value: resultado.totalComDSR },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default DSRComissoesCalculator;
