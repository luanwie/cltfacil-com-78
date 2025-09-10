import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, RotateCcw, Calendar, DollarSign, Clock } from "lucide-react";
import { formatBRL } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { PDFExportButton } from "@/components/ui/pdf-export-button";

type Modalidade = "dispensa" | "pedido" | "acordo" | "justa_causa";
type ExecucaoAviso = "Trabalhado" | "Indenizado";
type ReducaoTrabalhado = "2h_dia" | "7_dias";

type Resultado = {
  salario: string;
  anosCompletos: number;
  diasAviso: number;
  valorIndenizacao: string;
  modalidade: Modalidade;
  execucao: ExecucaoAviso;
  dataProjInicio?: string;
  dataProjFim?: string;
  observacoes: string;
};

const MS_DIA = 24 * 60 * 60 * 1000;

function diffAnosCompletos(inicioISO: string, fimISO: string) {
  const ini = new Date(inicioISO);
  const fim = new Date(fimISO);
  if (isNaN(ini.getTime()) || isNaN(fim.getTime()) || fim < ini) return 0;
  // anos completos (piso)
  let anos = fim.getFullYear() - ini.getFullYear();
  const m = fim.getMonth() - ini.getMonth();
  const d = fim.getDate() - ini.getDate();
  if (m < 0 || (m === 0 && d < 0)) anos -= 1;
  return Math.max(0, anos);
}

function diasAvisoProporcional(anosCompletos: number) {
  // Lei 12.506/2011: 30 + 3/dia por ano adicional (a partir do 2º), até 90
  const extra = Math.max(0, anosCompletos - 1) * 3;
  return Math.min(90, 30 + extra);
}

// soma N dias corridos (inclui sábados/domingos/feriados por padrão)
function addDiasCorridos(iso: string, dias: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + dias);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const AvisoPrevioCalculator = () => {
  const { toast } = useToast();

  // Gate global (4 grátis x PRO ilimitado)
  const { isPro, remaining, allowOrRedirect, incrementCount } = useUsageLimit();
  const overLimit = !isPro && (remaining ?? 0) <= 0;

  const [salario, setSalario] = useState<number | undefined>();
  const [dataAdmissao, setDataAdmissao] = useState<string>("");
  const [dataComunicacao, setDataComunicacao] = useState<string>(""); // data em que o aviso é comunicado
  const [modalidade, setModalidade] = useState<Modalidade>("dispensa");
  const [execucao, setExecucao] = useState<ExecucaoAviso>("Indenizado");
  const [reducaoTrabalhado, setReducaoTrabalhado] = useState<ReducaoTrabalhado>("2h_dia");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const countingRef = useRef(false); // evita duplo clique contar 2x

  function calcularInterno(): Resultado | null {
    if (!salario || salario <= 0 || !dataAdmissao || !dataComunicacao) return null;

    // justa causa: não há aviso prévio
    if (modalidade === "justa_causa") {
      return {
        salario: formatBRL(salario),
        anosCompletos: diffAnosCompletos(dataAdmissao, dataComunicacao),
        diasAviso: 0,
        valorIndenizacao: formatBRL(0),
        modalidade,
        execucao,
        observacoes: "Justa causa não gera aviso prévio nem indenização.",
      };
    }

    const anosCompletos = diffAnosCompletos(dataAdmissao, dataComunicacao);
    const diasBase = diasAvisoProporcional(anosCompletos);

    // quem deve o aviso:
    // - dispensa sem justa causa (pelo empregador): aviso devido ao empregado
    // - pedido de demissão (pelo empregado): aviso devido ao empregador (se não cumprido, pode ser descontado)
    // - acordo 484-A: metade dos dias/indenização
    let diasAviso = diasBase;
    let fatorIndenizacao = 1;

    if (modalidade === "acordo") {
      diasAviso = Math.floor(diasBase / 2);
      fatorIndenizacao = 0.5;
    }

    // valor da indenização:
    // - Indenizado: (salario/30) * diasAviso * fator
    // - Trabalhado: 0 (em tese); no pedido de demissão, se não cumprir, pode haver desconto por parte do empregador
    let valorIndenizacaoNum = 0;
    if (execucao === "Indenizado") {
      valorIndenizacaoNum = (salario / 30) * diasAviso * fatorIndenizacao;
    } else {
      // trabalhado => sem indenização
      valorIndenizacaoNum = 0;
    }

    // projeção da data de término (apenas no trabalhado faz diferença prática)
    // Por padrão, o aviso trabalhado soma dias corridos a partir do dia seguinte à comunicação.
    let dataProjInicio: string | undefined;
    let dataProjFim: string | undefined;

    if (execucao === "Trabalhado") {
      dataProjInicio = addDiasCorridos(dataComunicacao, 1); // começa no dia seguinte
      let diasCumprir = diasAviso;

      // redução de jornada: duas opções (art. 488 CLT)
      if (reducaoTrabalhado === "7_dias") {
        // reduz 7 dias corridos do período
        diasCumprir = Math.max(0, diasAviso - 7);
      } else {
        // 2 horas por dia úteis (aqui não calculamos horas; apenas informamos a regra)
        // mantemos o período cheio, apenas destaque na observação.
      }

      dataProjFim = addDiasCorridos(dataProjInicio, Math.max(0, diasCumprir));
    }

    // observações dinâmicas
    const obs: string[] = [];
    obs.push(`Progressão legal: 30 dias + 3 dias por ano a partir do 2º, limitado a 90.`);
    if (modalidade === "acordo") obs.push(`Acordo (art. 484-A): metade dos dias e da indenização.`);
    if (modalidade === "pedido") obs.push(`Pedido de demissão: se não cumprir o aviso trabalhado, pode haver desconto proporcional.`);
    if (execucao === "Trabalhado") {
      if (reducaoTrabalhado === "2h_dia") {
        obs.push(`Aviso trabalhado com redução de 2 horas diárias (art. 488, I).`);
      } else {
        obs.push(`Aviso trabalhado com redução de 7 dias corridos (art. 488, II).`);
      }
      obs.push(`Período projetado: ${dataProjInicio} a ${dataProjFim}.`);
    }

    return {
      salario: formatBRL(salario),
      anosCompletos,
      diasAviso,
      valorIndenizacao: formatBRL(valorIndenizacaoNum),
      modalidade,
      execucao,
      dataProjInicio,
      dataProjFim,
      observacoes: obs.join(" "),
    };
  }

  async function handleCalcular() {
    // Gate: redireciona para /assinar-pro se passou do limite
    const ok = await allowOrRedirect();
    if (!ok) return;

    const res = calcularInterno();
    if (!res) {
      toast({
        title: "Preencha os campos obrigatórios",
        description: "Informe salário, datas válidas e a modalidade/execução do aviso.",
      });
      return;
    }

    setResultado(res);

    // Incrementa uso (após cálculo OK)
    if (!countingRef.current) {
      countingRef.current = true;
      try {
        await incrementCount();
      } finally {
        setTimeout(() => {
          countingRef.current = false;
        }, 200);
      }
    }
  }

  function limpar() {
    setSalario(undefined);
    setDataAdmissao("");
    setDataComunicacao("");
    setModalidade("dispensa");
    setExecucao("Indenizado");
    setReducaoTrabalhado("2h_dia");
    setResultado(null);
  }

  const botaoDisabled =
    !salario || salario <= 0 || !dataAdmissao || !dataComunicacao || overLimit;

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo de Aviso Prévio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
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
              <Label htmlFor="modalidade">Modalidade de desligamento</Label>
              <Select value={modalidade} onValueChange={(v) => setModalidade(v as Modalidade)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dispensa">Dispensa sem justa causa (empregador)</SelectItem>
                  <SelectItem value="pedido">Pedido de demissão (empregado)</SelectItem>
                  <SelectItem value="acordo">Acordo (art. 484-A)</SelectItem>
                  <SelectItem value="justa_causa">Justa causa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="execucao">Execução do aviso</Label>
              <Select value={execucao} onValueChange={(v) => setExecucao(v as ExecucaoAviso)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comunicacao">Data da comunicação do aviso</Label>
              <input
                id="comunicacao"
                type="date"
                value={dataComunicacao}
                onChange={(e) => setDataComunicacao(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>

            {execucao === "Trabalhado" && (
              <div className="space-y-2">
                <Label htmlFor="reducao">Redução no trabalhado (art. 488)</Label>
                <Select value={reducaoTrabalhado} onValueChange={(v) => setReducaoTrabalhado(v as ReducaoTrabalhado)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2h_dia">Redução de 2 horas por dia</SelectItem>
                    <SelectItem value="7_dias">Redução de 7 dias corridos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCalcular} disabled={botaoDisabled} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              {overLimit ? "Limite atingido" : "Calcular Aviso Prévio"}
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
                <p className="text-sm text-muted-foreground">Anos completos</p>
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
                <p className="text-sm text-muted-foreground">Lei 12.506/2011 (máx. 90)</p>
              </CardContent>
            </Card>

            <Card className={resultado.execucao === "Indenizado" ? "border-primary/20 bg-primary/5" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Valor da Indenização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    resultado.execucao === "Indenizado" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {resultado.valorIndenizacao}
                </div>
                <p className="text-sm text-muted-foreground">
                  {resultado.execucao === "Indenizado" ? "Aviso indenizado" : "Aviso trabalhado"}
                </p>
              </CardContent>
            </Card>
          </div>

          {resultado.dataProjInicio && resultado.dataProjFim && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Período Projetado do Aviso Trabalhado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Início: <strong>{resultado.dataProjInicio}</strong> — Fim:{" "}
                  <strong>{resultado.dataProjFim}</strong>
                </p>
              </CardContent>
            </Card>
          )}

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
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
                  <div>
                    <p className="font-medium">Tempo de Serviço (anos completos)</p>
                    <p className="text-sm text-muted-foreground">Entre admissão e comunicação do aviso.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <p className="font-medium">Progressão do Aviso</p>
                    <p className="text-sm text-muted-foreground">30 dias + 3 por ano a partir do 2º (máx. 90).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <p className="font-medium">Indenização ou Trabalho</p>
                    <p className="text-sm text-muted-foreground">
                      Indenizado: (salário ÷ 30) × dias (no acordo: metade). Trabalhado: sem indenização;
                      pode haver redução de 2h/dia ou 7 dias.
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
            calculatorName="Calculadora de Aviso Prévio"
            results={[
              { label: "Salário Base", value: resultado.salario },
              { label: "Anos Completos", value: `${resultado.anosCompletos} anos` },
              { label: "Dias de Aviso", value: `${resultado.diasAviso} dias` },
              { label: "Valor da Indenização", value: resultado.valorIndenizacao },
              { label: "Observações", value: resultado.observacoes },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default AvisoPrevioCalculator;
