import React, { useRef, useState } from "react";
import { Calculator, RotateCcw, Clock, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Input } from "@/components/ui/input";
import Notice from "@/components/ui/notice";
import { useToast } from "@/hooks/use-toast";
import { useProAndUsage } from "@/hooks/useProAndUsage";

type Resultado = {
  saldo: number;
  saldoFormatado: string;
  classificacao: string;
  diasEquivalentes: number;
  dataLimite: string | null;
  horasPorDia: number;
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

const BancoDeHorasCalculator = () => {
  const { toast } = useToast();
  const { isPro, remaining, loading, incrementCount } = useProAndUsage();

  const [jornadaMensal, setJornadaMensal] = useState<number | undefined>(220);
  const [horasTrabalhadas, setHorasTrabalhadas] = useState<string>("");
  const [horasCompensadas, setHorasCompensadas] = useState<string>("");
  const [dataFechamento, setDataFechamento] = useState<string>("");
  const [prazoMeses, setPrazoMeses] = useState<number | undefined>(6);

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const countingRef = useRef(false); // evita descontar 2x no mesmo clique

  const calcularInterno = (): Resultado | null => {
    if (!jornadaMensal || jornadaMensal <= 0 || !horasTrabalhadas) return null;

    const jornada = Math.max(0, Number(jornadaMensal));
    const trabalhadas = Math.max(0, toHours(horasTrabalhadas));
    const compensadas = Math.max(0, toHours(horasCompensadas || "0"));

    // Saldo (horas)
    const saldo = (trabalhadas - jornada) - compensadas;

    // Equivalência em dias (aprox.)
    const horasPorDia = jornada / 30;
    const diasEquivalentes = horasPorDia > 0 ? (saldo / horasPorDia) : 0;

    // Formatação hh:mm
    const fmt = (h: number) => {
      const sign = h < 0 ? "-" : "";
      const abs = Math.abs(h);
      const hh = Math.floor(abs);
      const mm = Math.round((abs - hh) * 60);
      const mm2 = mm.toString().padStart(2, "0");
      return `${sign}${hh}:${mm2}`;
    };

    // Data limite (opcional)
    let dataLimite: string | null = null;
    if (dataFechamento && prazoMeses && prazoMeses > 0) {
      const d = new Date(dataFechamento);
      d.setMonth(d.getMonth() + Number(prazoMeses));
      dataLimite = d.toISOString().slice(0, 10);
    }

    const classificacao = saldo >= 0
      ? `Crédito de ${fmt(Math.abs(saldo))}h`
      : `Débito de ${fmt(Math.abs(saldo))}h`;

    return {
      saldo,
      saldoFormatado: fmt(saldo),
      classificacao,
      diasEquivalentes: Number(diasEquivalentes.toFixed(2)),
      dataLimite,
      horasPorDia: Number(horasPorDia.toFixed(2)),
    };
  };

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
        title: "Preencha os campos",
        description: "Informe jornada, horas trabalhadas e demais campos obrigatórios.",
      });
      return;
    }

    setResultado(res);

    // desconta 1 (somente não-PRO) após cálculo bem-sucedido
    if (!isPro && !countingRef.current) {
      countingRef.current = true;
      try {
        await (incrementCount?.() ?? Promise.resolve());
      } finally {
        setTimeout(() => (countingRef.current = false), 300);
      }
    }
  }

  function limparFormulario() {
    setJornadaMensal(220);
    setHorasTrabalhadas("");
    setHorasCompensadas("");
    setDataFechamento("");
    setPrazoMeses(6);
    setResultado(null);
  }

  const botaoDisabled =
    loading || !jornadaMensal || jornadaMensal <= 0 || !horasTrabalhadas;

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
            Calcule e controle seu saldo de banco de horas. Preencha os dados do período para obter o resultado.
          </Notice>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="jornada-mensal">Jornada mensal contratual (h)</Label>
              <NumberInput
                id="jornada-mensal"
                value={jornadaMensal}
                onChange={setJornadaMensal}
                min={0}
                placeholder="220"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horas-trabalhadas">
                Horas trabalhadas no período (h ou hh:mm)
              </Label>
              <Input
                id="horas-trabalhadas"
                value={horasTrabalhadas}
                onChange={(e) => setHorasTrabalhadas(e.target.value)}
                placeholder="10.5 ou 10:30"
              />
              <p className="text-sm text-muted-foreground">
                Digite em horas decimais (10.5) ou formato hh:mm (10:30)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horas-compensadas">
                Horas já compensadas/abonadas (h ou hh:mm, opcional)
              </Label>
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
              <Label htmlFor="prazo-meses">Prazo para compensação (meses)</Label>
              <NumberInput
                id="prazo-meses"
                value={prazoMeses}
                onChange={setPrazoMeses}
                min={1}
                max={12}
                placeholder="6"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCalcular} disabled={botaoDisabled} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              Calcular
            </Button>
            <Button variant="outline" onClick={limparFormulario}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {resultado && (
        <div className="space-y-4">
          <Card className={`border-2 ${resultado.saldo >= 0 ? 'border-green-500/20 bg-green-50/50' : 'border-red-500/20 bg-red-50/50'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className={`w-5 h-5 ${resultado.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                Saldo de Banco de Horas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${resultado.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {resultado.saldoFormatado}
                  </div>
                  <p className={`text-lg font-medium ${resultado.saldo >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {resultado.classificacao}
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="p-3 rounded-lg bg-background border">
                    <div className="text-sm text-muted-foreground">Equivalência em dias</div>
                    <div className="text-xl font-semibold">
                      {resultado.diasEquivalentes > 0 ? '+' : ''}{resultado.diasEquivalentes} dias
                    </div>
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
                    <p className="font-medium">Conversão para horas</p>
                    <p className="text-sm text-muted-foreground">Formato hh:mm convertido para decimal (ex: 10:30 = 10.5h)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <p className="font-medium">Cálculo do saldo</p>
                    <p className="text-sm text-muted-foreground">Saldo = (Horas trabalhadas - Jornada contratual) - Horas compensadas</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <p className="font-medium">Equivalência em dias</p>
                    <p className="text-sm text-muted-foreground">Dias = Saldo ÷ ({resultado.horasPorDia}h por dia)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">4</div>
                  <div>
                    <p className="font-medium">Prazo para compensação</p>
                    <p className="text-sm text-muted-foreground">Data limite = Data de fechamento + {prazoMeses || 6} meses</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-accent rounded-lg">
                <p className="text-sm text-accent-foreground">
                  <strong>Lembre-se:</strong> O banco de horas deve ser compensado dentro do prazo legal
                  para evitar o pagamento como hora extra com adicional de 50%.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BancoDeHorasCalculator;
