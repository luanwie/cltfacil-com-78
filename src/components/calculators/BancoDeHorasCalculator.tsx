import React, { useRef, useState } from "react";
import { Calculator, RotateCcw, Clock, TrendingUp, Calendar, DollarSign, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Input } from "@/components/ui/input";
import Notice from "@/components/ui/notice";
import { useToast } from "@/hooks/use-toast";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { formatBRL } from "@/lib/currency";
import { PDFExportButton } from "@/components/ui/pdf-export-button";
import SaveCalcButton from "@/components/SaveCalcButton";

type ModalidadePrazo = "mensal_30d" | "acordo_individual_6m" | "acordo_coletivo_12m" | "personalizado";

type Resultado = {
  saldo: number;                 // em horas (positivo = crédito; negativo = débito)
  saldoFormatado: string;        // hh:mm com sinal
  classificacao: string;         // “Crédito de Xh” / “Débito de Xh”
  diasEquivalentes: number;      // saldo / horasPorDia
  dataLimite: string | null;     // prazo legal para compensação, se houver
  horasPorDia: number;           // jornada mensal / 30
  valorAPagarSeExpirar?: string; // se expirar, cálculo de hora extra com adicional
  expirado?: boolean;            // se já passou do prazo (quando há dataLimite)
};

const toHours = (v: string | number) => {
  if (typeof v === "number") return v;
  if (!v) return 0;
  if (v.includes(":")) {
    const [hh, mm = "0"] = v.split(":");
    return Number(hh) + Number(mm) / 60;
    }
  return Number(v);
};

const fmtHHMM = (h: number) => {
  const sign = h < 0 ? "-" : "";
  const abs = Math.abs(h);
  const hh = Math.floor(abs);
  const mm = Math.round((abs - hh) * 60);
  const mm2 = mm.toString().padStart(2, "0");
  return `${sign}${hh}:${mm2}`;
};

// soma meses corridos a uma data ISO (YYYY-MM-DD)
const addMonthsISO = (iso: string, months: number) => {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// soma dias corridos a uma data ISO
const addDaysISO = (iso: string, days: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const BancoDeHorasCalculator = () => {
  const { toast } = useToast();

  // Gate global (4 grátis x PRO ilimitado)
  const { isPro, remaining, allowOrRedirect, incrementCount } = useUsageLimit();
  const overLimit = !isPro && (remaining ?? 0) <= 0;

  // Entradas
  const [salarioMensal, setSalarioMensal] = useState<number | undefined>();
  const [jornadaMensal, setJornadaMensal] = useState<number | undefined>(220);
  const [horasTrabalhadas, setHorasTrabalhadas] = useState<string>("");   // aceita “10.5” ou “10:30”
  const [horasCompensadas, setHorasCompensadas] = useState<string>("");   // idem
  const [dataFechamento, setDataFechamento] = useState<string>("");       // data de referência do período
  const [modalidadePrazo, setModalidadePrazo] = useState<ModalidadePrazo>("acordo_individual_6m");
  const [prazoMesesCustom, setPrazoMesesCustom] = useState<number | undefined>(6);
  const [adicionalHoraExtra, setAdicionalHoraExtra] = useState<number>(50); // % para cálculo se expirar (ex.: 50)

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const countingRef = useRef(false); // evita descontar 2x no mesmo clique

  const calcularInterno = (): Resultado | null => {
    // validações mínimas
    if (!jornadaMensal || jornadaMensal <= 0) return null;
    if (!horasTrabalhadas) return null;

    const jornada = Math.max(0, Number(jornadaMensal));
    const trabalhadas = Math.max(0, toHours(horasTrabalhadas));
    const compensadas = Math.max(0, toHours(horasCompensadas || "0"));

    // Saldo (horas): + crédito; – débito
    const saldo = (trabalhadas - jornada) - compensadas;

    // Equivalência em dias
    const horasPorDia = jornada / 30;
    const diasEquivalentes = horasPorDia > 0 ? Number((saldo / horasPorDia).toFixed(2)) : 0;

    // Prazo legal (data limite) — depende da modalidade
    let dataLimite: string | null = null;
    if (dataFechamento) {
      if (modalidadePrazo === "mensal_30d") {
        dataLimite = addDaysISO(dataFechamento, 30);
      } else if (modalidadePrazo === "acordo_individual_6m") {
        dataLimite = addMonthsISO(dataFechamento, 6);
      } else if (modalidadePrazo === "acordo_coletivo_12m") {
        dataLimite = addMonthsISO(dataFechamento, 12);
      } else if (modalidadePrazo === "personalizado" && prazoMesesCustom && prazoMesesCustom > 0) {
        dataLimite = addMonthsISO(dataFechamento, prazoMesesCustom);
      }
    }

    // Classificação textual
    const classificacao =
      saldo >= 0 ? `Crédito de ${fmtHHMM(Math.abs(saldo))}h` : `Débito de ${fmtHHMM(Math.abs(saldo))}h`;

    const base: Resultado = {
      saldo,
      saldoFormatado: fmtHHMM(saldo),
      classificacao,
      diasEquivalentes,
      dataLimite,
      horasPorDia: Number(horasPorDia.toFixed(2)),
    };

    // Cálculo de valor a pagar como hora extra se EXPIRAR (opcional, requer salário + jornada)
    // Fórmula: valorHora = salárioMensal / jornadaMensal; hora extra = valorHora * (1 + adicional%)
    if (salarioMensal && jornadaMensal && dataLimite) {
      const hojeISO = new Date();
      const expirado = hojeISO > new Date(dataLimite);
      base.expirado = expirado;

      if (expirado && saldo > 0) {
        const valorHora = salarioMensal / jornadaMensal;
        const fator = 1 + (adicionalHoraExtra / 100);
        const valor = saldo * valorHora * fator;
        base.valorAPagarSeExpirar = formatBRL(valor);
      }
    }

    return base;
  };

  async function handleCalcular() {
    // Gate global
    const ok = await allowOrRedirect();
    if (!ok) return;

    // validação rápida
    if (!jornadaMensal || jornadaMensal <= 0 || !horasTrabalhadas) {
      toast({
        title: "Preencha os campos",
        description: "Informe jornada mensal e horas trabalhadas (em decimal ou hh:mm).",
      });
      return;
    }

    const res = calcularInterno();
    if (!res) {
      toast({
        title: "Dados insuficientes",
        description: "Revise os campos obrigatórios e tente novamente.",
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

  function limparFormulario() {
    setSalarioMensal(undefined);
    setJornadaMensal(220);
    setHorasTrabalhadas("");
    setHorasCompensadas("");
    setDataFechamento("");
    setModalidadePrazo("acordo_individual_6m");
    setPrazoMesesCustom(6);
    setAdicionalHoraExtra(50);
    setResultado(null);
  }

  const botaoDisabled = !jornadaMensal || jornadaMensal <= 0 || !horasTrabalhadas || overLimit;

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Calculadora de Banco de Horas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Notice variant="info">
            Calcule o saldo de banco de horas do período e visualize o prazo para compensação.
            Preencha os campos abaixo. Aceitamos horas em decimal (<strong>10.5</strong>) ou formato <strong>hh:mm</strong> (<strong>10:30</strong>).
          </Notice>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jornada-mensal">Jornada mensal contratual (h)</Label>
              <NumberInput
                id="jornada-mensal"
                value={jornadaMensal}
                onChange={setJornadaMensal}
                min={0}
                placeholder="220"
              />
              <p className="text-xs text-muted-foreground">Usamos {jornadaMensal ?? 0}h ÷ 30 ≈ {((jornadaMensal ?? 0)/30).toFixed(2)}h/dia.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salario">Salário mensal (R$) — opcional (para valor ao expirar)</Label>
              <NumberInput
                id="salario"
                value={salarioMensal}
                onChange={setSalarioMensal}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
              <p className="text-xs text-muted-foreground">
                Se informado, calculamos o valor estimado a pagar como hora extra caso o prazo expire.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horas-trabalhadas">Horas trabalhadas no período (h ou hh:mm)</Label>
              <Input
                id="horas-trabalhadas"
                value={horasTrabalhadas}
                onChange={(e) => setHorasTrabalhadas(e.target.value)}
                placeholder="e.g., 195.5 ou 195:30"
              />
              <p className="text-sm text-muted-foreground">Digite em decimal ou hh:mm. Converteremos automaticamente.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horas-compensadas">Horas já compensadas/abonadas (h ou hh:mm, opcional)</Label>
              <Input
                id="horas-compensadas"
                value={horasCompensadas}
                onChange={(e) => setHorasCompensadas(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data-fechamento">Data de fechamento do período (opcional)</Label>
              <Input
                id="data-fechamento"
                type="date"
                value={dataFechamento}
                onChange={(e) => setDataFechamento(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modalidade-prazo">Modalidade de prazo para compensação</Label>
              <select
                id="modalidade-prazo"
                className="w-full border rounded-md h-10 px-3 bg-background"
                value={modalidadePrazo}
                onChange={(e) => setModalidadePrazo(e.target.value as ModalidadePrazo)}
              >
                <option value="mensal_30d">Compensação mensal (30 dias)</option>
                <option value="acordo_individual_6m">Acordo individual escrito (6 meses)</option>
                <option value="acordo_coletivo_12m">Acordo/Convenção coletiva (12 meses)</option>
                <option value="personalizado">Personalizado (em meses)</option>
              </select>
            </div>

            {modalidadePrazo === "personalizado" && (
              <div className="space-y-2">
                <Label htmlFor="prazo-meses">Prazo personalizado (meses)</Label>
                <NumberInput
                  id="prazo-meses"
                  value={prazoMesesCustom}
                  onChange={setPrazoMesesCustom}
                  min={1}
                  max={24}
                  placeholder="6"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="adicional">Adicional de hora extra para valor ao expirar (%)</Label>
              <NumberInput
                id="adicional"
                value={adicionalHoraExtra}
                onChange={(v) => setAdicionalHoraExtra(v || 50)}
                min={0}
                max={100}
                suffix="%"
                placeholder="50"
              />
              <p className="text-xs text-muted-foreground">Ex.: 50% para dias úteis, 100% domingos/feriados (padrões comuns, podem variar por CCT).</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCalcular} disabled={botaoDisabled} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              {overLimit ? "Limite atingido" : "Calcular"}
            </Button>
            <Button variant="outline" onClick={limparFormulario}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {resultado && (
        <div className="space-y-4">
          <Card className={`border-2 ${resultado.saldo >= 0 ? "border-green-500/20 bg-green-50/50" : "border-red-500/20 bg-red-50/50"}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className={`w-5 h-5 ${resultado.saldo >= 0 ? "text-green-600" : "text-red-600"}`} />
                Saldo de Banco de Horas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${resultado.saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {resultado.saldoFormatado}
                  </div>
                  <p className={`text-lg font-medium ${resultado.saldo >= 0 ? "text-green-700" : "text-red-700"}`}>
                    {resultado.classificacao}
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="p-3 rounded-lg bg-background border">
                    <div className="text-sm text-muted-foreground">Equivalência em dias</div>
                    <div className="text-xl font-semibold">
                      {resultado.diasEquivalentes > 0 ? "+" : ""}
                      {resultado.diasEquivalentes} dias
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-background border">
                    <div className="text-sm text-muted-foreground">Jornada média diária</div>
                    <div className="text-xl font-semibold">{resultado.horasPorDia} h/dia</div>
                  </div>

                  {resultado.dataLimite && (
                    <div className="p-3 rounded-lg bg-background border">
                      <div className="text-sm text-muted-foreground">Data limite para compensar</div>
                      <div className="text-xl font-semibold">
                        {new Date(resultado.dataLimite).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  )}
                </div>

                {resultado.expirado && resultado.valorAPagarSeExpirar && (
                  <div className="p-3 rounded-lg border bg-amber-50 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-700" />
                    <div className="text-sm">
                      Prazo expirado com <strong>crédito</strong> de horas. Estimativa de pagamento como hora extra
                      com adicional aplicado: <strong>{resultado.valorAPagarSeExpirar}</strong>.
                    </div>
                  </div>
                )}
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
                    <p className="font-medium">Conversão de horas</p>
                    <p className="text-sm text-muted-foreground">Aceitamos decimal ou hh:mm (ex.: 195:30 = 195,5h).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <p className="font-medium">Saldo do banco</p>
                    <p className="text-sm text-muted-foreground">Saldo = (Trabalhadas − Jornada) − Compensadas.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <p className="font-medium">Equivalência em dias</p>
                    <p className="text-sm text-muted-foreground">Dias ≈ Saldo ÷ (Jornada ÷ 30).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">4</div>
                  <div>
                    <p className="font-medium">Prazo legal</p>
                    <p className="text-sm text-muted-foreground">
                      Compensação mensal (30d), acordo individual (6m), acordo/conv. coletiva (12m) ou prazo personalizado.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">5</div>
                  <div>
                    <p className="font-medium">Hora extra ao expirar (opcional)</p>
                    <p className="text-sm text-muted-foreground">
                      Valor estimado = Saldo(h) × (Salário ÷ Jornada) × (1 + adicional%).
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-accent rounded-lg">
                <p className="text-sm text-accent-foreground">
                  <strong>Importante:</strong> o banco de horas exige acordo (individual escrito ou coletivo).
                  Prazos típicos: <em>30 dias</em> (compensação mensal), <em>6 meses</em> (acordo individual),
                  <em>12 meses</em> (acordo/conv. coletiva). Normas da sua CCT podem trazer regras específicas.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botão Exportar PDF */}
      {resultado && (
        <div className="flex gap-2 justify-center flex-wrap">
          <SaveCalcButton
            calculator="banco_horas"
            calculationType="banco_horas"
            input={{
              salarioMensal,
              jornadaMensal,
              horasTrabalhadas,
              horasCompensadas,
              dataFechamento,
              modalidadePrazo
            }}
            result={resultado}
            disabled={!resultado}
          />
          <PDFExportButton
            calculatorName="Calculadora de Banco de Horas"
            results={[
              { label: "Saldo em Horas", value: resultado.saldoFormatado },
              { label: "Classificação", value: resultado.classificacao },
              { label: "Dias Equivalentes", value: `${resultado.diasEquivalentes.toFixed(1)} dias` },
              { label: "Data Limite para Compensação", value: resultado.dataLimite || "N/A" },
              ...(resultado.valorAPagarSeExpirar ? [
                { label: "Valor Estimado (Hora Extra)", value: resultado.valorAPagarSeExpirar }
              ] : []),
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default BancoDeHorasCalculator;
