import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, RotateCcw, Calendar, DollarSign, Clock } from "lucide-react";
import { formatBRL } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { useProAndUsage } from "@/hooks/useProAndUsage";

type Resultado = {
  salario: string;
  anosCompletos: number;
  diasAviso: number;
  valorIndenizacao: string;
  modo: string;
  observacoes: string;
};

const MS_DIA = 24 * 60 * 60 * 1000;

const AvisoPrevioCalculator = () => {
  const { toast } = useToast();
  const { isPro, remaining, loading, incrementCount } = useProAndUsage();
  const [salario, setSalario] = useState<number | undefined>();
  const [dataAdmissao, setDataAdmissao] = useState<string>("");
  const [dataDesligamento, setDataDesligamento] = useState<string>("");
  const [modo, setModo] = useState<string>("Indenizado");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const countingRef = useRef(false); // evita descontar duas vezes no mesmo cálculo

  function calcularInterno(): Resultado | null {
    if (!salario || salario <= 0 || !dataAdmissao || !dataDesligamento) return null;

    const admissao = new Date(dataAdmissao);
    const desligamento = new Date(dataDesligamento);
    if (desligamento < admissao) return null;

    const anosCompletos = Math.max(
      0,
      Math.floor((desligamento.getTime() - admissao.getTime()) / (365.25 * MS_DIA))
    );
    const diasAviso = Math.min(90, 30 + 3 * Math.max(0, anosCompletos - 1));
    const valorIndenizacaoNum = modo === "Indenizado" ? (salario / 30) * diasAviso : 0;

    return {
      salario: formatBRL(salario),
      anosCompletos,
      diasAviso,
      valorIndenizacao: formatBRL(valorIndenizacaoNum),
      modo,
      observacoes:
        modo === "Trabalhado"
          ? "Empregado deve cumprir o período normalmente"
          : "Valor pago sem necessidade de trabalhar",
    };
  }

  async function handleCalcular() {
    // enquanto o status carrega, não faz nada
    if (loading) return;

    // regra de uso: PRO sempre pode; não-PRO precisa ter remaining > 0
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
        description: "Informe salário, datas válidas e o modo do aviso.",
      });
      return;
    }

    setResultado(res);

    // desconta 1 do global apenas para não-PRO e uma única vez por clique
    if (!isPro && !countingRef.current) {
      countingRef.current = true;
      try {
        await (incrementCount?.() ?? Promise.resolve());
      } finally {
        // libera após curto intervalo para evitar duplo clique contaminar
        setTimeout(() => {
          countingRef.current = false;
        }, 300);
      }
    }
  }

  function limpar() {
    setSalario(undefined);
    setDataAdmissao("");
    setDataDesligamento("");
    setModo("Indenizado");
    setResultado(null);
  }

  const botaoDisabled =
    loading || !salario || salario <= 0 || !dataAdmissao || !dataDesligamento;

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo de Aviso Prévio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <Label htmlFor="modo">Modo do aviso</Label>
              <Select value={modo} onValueChange={setModo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trabalhado">Trabalhado</SelectItem>
                  <SelectItem value="Indenizado">Indenizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admissao">Data de admissão</Label>
              <input
                id="admissao"
                type="date"
                value={dataAdmissao}
                onChange={(e) => setDataAdmissao(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desligamento">Data de desligamento</Label>
              <input
                id="desligamento"
                type="date"
                value={dataDesligamento}
                onChange={(e) => setDataDesligamento(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCalcular} disabled={botaoDisabled} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              Calcular Aviso Prévio
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
                  <Clock className="w-4 h-4" />
                  Tempo de Serviço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resultado.anosCompletos} anos</div>
                <p className="text-sm text-muted-foreground">Completos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Dias de Aviso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{resultado.diasAviso} dias</div>
                <p className="text-sm text-muted-foreground">Progressão legal</p>
              </CardContent>
            </Card>

            <Card className={resultado.modo === "Indenizado" ? "border-primary/20 bg-primary/5" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Valor da Indenização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    resultado.modo === "Indenizado" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {resultado.valorIndenizacao}
                </div>
                <p className="text-sm text-muted-foreground">{resultado.modo}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{resultado.observacoes}</p>
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
                    <p className="font-medium">Tempo de Serviço</p>
                    <p className="text-sm text-muted-foreground">
                      Calculado em anos completos: {resultado.anosCompletos} anos
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Progressão do Aviso</p>
                    <p className="text-sm text-muted-foreground">
                      30 dias + 3 dias por ano (a partir do 2º ano) = {resultado.diasAviso} dias
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Valor da Indenização</p>
                    <p className="text-sm text-muted-foreground">
                      {resultado.modo === "Indenizado"
                        ? `(${resultado.salario} ÷ 30) × ${resultado.diasAviso} dias = ${resultado.valorIndenizacao}`
                        : "Aviso trabalhado não gera indenização"}
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

export default AvisoPrevioCalculator;
