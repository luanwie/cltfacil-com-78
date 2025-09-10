import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calculator, RotateCcw, DollarSign, TrendingUp, Info, Percent } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/currency";
import Notice from "@/components/ui/notice";
import { useToast } from "@/hooks/use-toast";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { PDFExportButton } from "@/components/ui/pdf-export-button";
import SaveCalcButton from "@/components/SaveCalcButton";
import { useCalculationReload } from "@/hooks/useCalculationReload";

/** Tipos de contrato suportados */
type Contrato = "clt" | "aprendiz" | "domestico";

/** Multa rescisória */
type Multa = "40" | "20" | "0";

/** Resultado principal da simulação */
type Resultado = {
  tipoContrato: string;
  aliquotaFgts: number;           // 0.08 / 0.02 / 0.08 (doméstico)
  aliquotaIndenizacao?: number;   // 0.032 (apenas doméstico)
  depositoMensalFgts: number;     // R$ (FGTS mensal)
  depositoMensalInd?: number;     // R$ (indenização mensal doméstico)
  meses: number;
  fgts13Proporcional: number;     // R$ (opcional)
  totalDepositos: number;         // FGTS + (indenização se doméstico) + 13º FGTS (se marcado)
  rendimentoEstimado: number;     // R$
  saldoProjetado: number;         // R$
  multaAliquota: number;          // 0.4 / 0.2 / 0.0
  multaValor: number;             // R$ sobre saldoProjetado
  totalComMulta: number;          // saldoProjetado + multa
  // saque-aniversário
  saqueAniversario?: {
    valorSaque: number;
    saldoAposSaque: number;
    faixaPercentual: string;
    parcelaAdicional: number;
  };
};

function contratoLabel(c: Contrato) {
  switch (c) {
    case "clt": return "CLT (8%)";
    case "aprendiz": return "Aprendiz (2%)";
    case "domestico": return "Doméstico (8% + 3,2% indenização)";
  }
}

function aliquotaFgts(c: Contrato) {
  if (c === "aprendiz") return 0.02;
  return 0.08; // clt e doméstico
}
function aliquotaIndenizacaoDomestico(c: Contrato) {
  return c === "domestico" ? 0.032 : 0;
}

/** taxa mensal aproximada a partir de juros a.a. + TR a.a. */
function taxaMensal(jurosAA: number, trAA: number) {
  // Aproximação conservadora: (1+jurosAA)^(1/12)-1 + TR/12
  const mensalJuros = Math.pow(1 + (jurosAA || 0), 1 / 12) - 1;
  const mensalTR = (trAA || 0) / 12;
  return mensalJuros + mensalTR;
}

/** Projeção mensal composta: começa do saldoInicial; a cada mês deposita e rende. */
function projetarSaldo(
  saldoInicial: number,
  depositoMensalFgts: number,
  meses: number,
  taxaMensalRendimento: number,
  depositoIndenizacaoMensal = 0
) {
  let saldo = Math.max(0, saldoInicial);
  let rend = 0;

  for (let i = 0; i < meses; i++) {
    // depósitos do mês
    saldo += depositoMensalFgts + (depositoIndenizacaoMensal || 0);
    // rendimento sobre o saldo do mês
    const ganho = saldo * taxaMensalRendimento;
    rend += ganho;
    saldo += ganho;
  }
  return { saldo, rendimento: rend };
}

/** FGTS sobre 13º proporcional: 8% * (salário * avos/12). Para aprendiz/doméstico, usa a alíquota FGTS do contrato. */
function fgtsSobre13Proporcional(salario: number, meses: number, aliquotaFgtsContrato: number) {
  const avos = Math.min(12, Math.max(0, meses));
  return salario * (avos / 12) * aliquotaFgtsContrato;
}

/** Tabela oficial do saque-aniversário (percentual + parcela adicional) */
function calcularSaqueAniversario(saldo: number) {
  const faixas = [
    { ate: 500, perc: 0.5, adic: 0 },
    { ate: 1000, perc: 0.4, adic: 50 },
    { ate: 5000, perc: 0.3, adic: 150 },
    { ate: 10000, perc: 0.2, adic: 650 },
    { ate: 15000, perc: 0.15, adic: 1150 },
    { ate: 20000, perc: 0.10, adic: 1900 },
    { ate: Infinity, perc: 0.05, adic: 2900 },
  ];
  const f = faixas.find((fx) => saldo <= fx.ate)!;
  const valor = saldo * f.perc + f.adic;
  return {
    valor: Math.max(0, Math.min(valor, saldo)), // não pode sacar acima do saldo
    percRotulo: formatPercent(f.perc),
    adic: f.adic,
  };
}

export default function FGTSCalculator() {
  const { toast } = useToast();
  const { isPro, remaining, allowOrRedirect, incrementCount } = useUsageLimit();

  // inputs
  const [salario, setSalario] = useState<number | undefined>();
  const [meses, setMeses] = useState<number | undefined>(12);
  const [saldoInicial, setSaldoInicial] = useState<number | undefined>(0);
  const [contrato, setContrato] = useState<Contrato>("clt");
  const [multa, setMulta] = useState<Multa>("40");

  // rendimento
  const [considerarRendimento, setConsiderarRendimento] = useState<boolean>(true);
  const [trAA, setTrAA] = useState<number | undefined>(0); // TR anual estimada (%)
  const jurosAA = 0.03; // 3% a.a. fixo por lei

  // 13º FGTS proporcional
  const [incluir13, setIncluir13] = useState<boolean>(true);
  const [meses13, setMeses13] = useState<number | undefined>(12);

  // saque-aniversário (opcional)
  const [simularSaque, setSimularSaque] = useState<boolean>(false);

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const countingRef = useRef(false);

  // Hook para recarregar dados salvos
  useCalculationReload((inputs) => {
    if (inputs.salario !== undefined) setSalario(inputs.salario);
    if (inputs.meses !== undefined) setMeses(inputs.meses);
    if (inputs.saldoInicial !== undefined) setSaldoInicial(inputs.saldoInicial);
    if (inputs.contrato !== undefined) setContrato(inputs.contrato);
    if (inputs.multa !== undefined) setMulta(inputs.multa);
    if (inputs.considerarRendimento !== undefined) setConsiderarRendimento(inputs.considerarRendimento);
    if (inputs.trAA !== undefined) setTrAA(inputs.trAA);
    if (inputs.incluir13 !== undefined) setIncluir13(inputs.incluir13);
    if (inputs.meses13 !== undefined) setMeses13(inputs.meses13);
    if (inputs.simularSaque !== undefined) setSimularSaque(inputs.simularSaque);
  }, setResultado);

  const canCalcInputs =
    (salario ?? 0) > 0 && (meses ?? 0) > 0;

  const aliquotaFGTS = aliquotaFgts(contrato);
  const aliquotaInd = aliquotaIndenizacaoDomestico(contrato);

  const multaAliquota = ((): number => {
    if (multa === "40") return 0.4;
    if (multa === "20") return 0.2;
    return 0;
  })();

  function calcularInterno(): Resultado | null {
    if (!canCalcInputs) return null;

    const mesesVal = Math.max(1, Math.min(120, meses ?? 12)); // permite projeções longas
    const baseSalario = salario ?? 0;
    const saldoBase = Math.max(0, saldoInicial ?? 0);

    const depMensalFgts = baseSalario * aliquotaFGTS;
    const depMensalInd = baseSalario * (aliquotaInd || 0);

    const taxaM = considerarRendimento ? taxaMensal(jurosAA, (trAA ?? 0) / 100) : 0;

    // Projeta mês a mês: saldo + depósitos (FGTS + indenização doméstico), com rendimento
    const proj = projetarSaldo(saldoBase, depMensalFgts, mesesVal, taxaM, depMensalInd);

    // FGTS sobre 13º proporcional (se habilitado)
    const meses13Valid = Math.max(0, Math.min(12, meses13 ?? mesesVal));
    const fgts13 = incluir13 ? fgtsSobre13Proporcional(baseSalario, meses13Valid, aliquotaFGTS) : 0;

    // Total de depósitos (FGTS + indenização doméstico + FGTS 13º)
    const totalDepositos = depMensalFgts * mesesVal + depMensalInd * mesesVal + fgts13;

    // Se houver 13º FGTS, aplicamos rendimento do mês seguinte? Para simplificar, somamos ao saldo projetado final (conservador)
    const saldoProjetado = proj.saldo + fgts13;

    // Multa sobre saldo projetado
    const multaValor = saldoProjetado * multaAliquota;
    const totalComMulta = saldoProjetado + multaValor;

    // Saque-aniversário opcional (sobre saldo projetado sem multa)
    let saqueBlock: Resultado["saqueAniversario"] | undefined = undefined;
    if (simularSaque) {
      const s = calcularSaqueAniversario(saldoProjetado);
      saqueBlock = {
        valorSaque: s.valor,
        saldoAposSaque: saldoProjetado - s.valor,
        faixaPercentual: `${s.percRotulo} + parcela`,
        parcelaAdicional: s.adic,
      };
    }

    return {
      tipoContrato: contratoLabel(contrato),
      aliquotaFgts: aliquotaFGTS,
      aliquotaIndenizacao: aliquotaInd || undefined,
      depositoMensalFgts: depMensalFgts,
      depositoMensalInd: aliquotaInd ? depMensalInd : undefined,
      meses: mesesVal,
      fgts13Proporcional: fgts13,
      totalDepositos,
      rendimentoEstimado: proj.rendimento,
      saldoProjetado,
      multaAliquota,
      multaValor,
      totalComMulta,
      saqueAniversario: saqueBlock,
    };
  }

  async function handleCalcular() {
    const ok = await allowOrRedirect();
    if (!ok) return;

    const r = calcularInterno();
    if (!r) {
      toast({
        title: "Campos inválidos",
        description: "Informe salário e meses válidos para projetar.",
      });
      return;
    }

    setResultado(r);

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
    setSalario(undefined);
    setMeses(12);
    setSaldoInicial(0);
    setContrato("clt");
    setMulta("40");
    setConsiderarRendimento(true);
    setTrAA(0);
    setIncluir13(true);
    setMeses13(12);
    setSimularSaque(false);
    setResultado(null);
  }

  const overLimit = !isPro && (remaining ?? 0) <= 0;

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Simulação FGTS (Completa)
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Notice variant="info">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5" />
              <p className="text-sm">
                Rendimento estimado usa <strong>3% a.a. + TR a.a.</strong> (informada por você) com capitalização
                mensal aproximada. Para saldo real, consulte o app oficial do FGTS.
              </p>
            </div>
          </Notice>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="salario">Salário mensal</Label>
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
              <Label htmlFor="meses">Meses de projeção</Label>
              <NumberInput
                id="meses"
                value={meses}
                onChange={setMeses}
                min={1}
                max={120}
                placeholder="12"
              />
              <p className="text-xs text-muted-foreground">Aceita 1–120 meses</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="saldo-inicial">Saldo atual FGTS</Label>
              <NumberInput
                id="saldo-inicial"
                value={saldoInicial}
                onChange={setSaldoInicial}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de contrato</Label>
              <Select value={contrato} onValueChange={(v: Contrato) => setContrato(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clt">CLT (8%)</SelectItem>
                  <SelectItem value="aprendiz">Aprendiz (2%)</SelectItem>
                  <SelectItem value="domestico">Doméstico (8% FGTS + 3,2% indenização)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Multa rescisória</Label>
              <Select value={multa} onValueChange={(v: Multa) => setMulta(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="40">40% — Sem justa causa</SelectItem>
                  <SelectItem value="20">20% — Acordo (art. 484-A)</SelectItem>
                  <SelectItem value="0">0% — Outras situações</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Percent className="w-4 h-4" /> TR anual (estimativa)
              </Label>
              <NumberInput
                value={trAA}
                onChange={setTrAA}
                suffix="%"
                min={0}
                max={10}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">Deixe 0% se não quiser estimar TR</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rend"
                checked={considerarRendimento}
                onCheckedChange={(c) => setConsiderarRendimento(!!c)}
              />
              <Label htmlFor="rend" className="text-sm font-normal">
                Considerar rendimento (3% a.a. + TR)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="inclui13"
                checked={incluir13}
                onCheckedChange={(c) => setIncluir13(!!c)}
              />
              <Label htmlFor="inclui13" className="text-sm font-normal">
                Incluir FGTS sobre 13º proporcional
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meses13">Meses para 13º (avos)</Label>
              <NumberInput
                id="meses13"
                value={meses13}
                onChange={setMeses13}
                min={0}
                max={12}
                placeholder="12"
                disabled={!incluir13}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="saque"
              checked={simularSaque}
              onCheckedChange={(c) => setSimularSaque(!!c)}
            />
            <Label htmlFor="saque" className="text-sm font-normal">
              Simular saque-aniversário sobre o saldo projetado
            </Label>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCalcular}
              disabled={overLimit || !canCalcInputs}
              className="flex-1"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {overLimit ? "Limite atingido" : "Calcular FGTS"}
            </Button>
            <Button variant="outline" onClick={limpar}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {resultado && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Depósitos e Projeção
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-xs text-muted-foreground">Contrato</div>
                <div className="text-sm font-medium">{resultado.tipoContrato}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Depósito mensal (FGTS)</div>
                <div className="text-xl font-semibold text-primary">
                  {formatBRL(resultado.depositoMensalFgts)}
                </div>
              </div>
              {resultado.depositoMensalInd !== undefined && (
                <div>
                  <div className="text-xs text-muted-foreground">Indenização mensal (doméstico)</div>
                  <div className="text-xl font-semibold">
                    {formatBRL(resultado.depositoMensalInd)}
                  </div>
                </div>
              )}
              <div>
                <div className="text-xs text-muted-foreground">Meses de projeção</div>
                <div className="text-xl font-semibold">{resultado.meses}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">FGTS sobre 13º (proporcional)</div>
                <div className="text-xl font-semibold">
                  {formatBRL(resultado.fgts13Proporcional)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total depositado</div>
                <div className="text-xl font-bold text-primary">
                  {formatBRL(resultado.totalDepositos)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Saldo e Rendimentos
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-xs text-muted-foreground">Rendimento estimado</div>
                <div className="text-xl font-semibold">
                  {formatBRL(resultado.rendimentoEstimado)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Saldo projetado</div>
                <div className="text-2xl font-bold text-primary">
                  {formatBRL(resultado.saldoProjetado)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Multa rescisória</div>
                <div className="text-xl font-semibold">
                  {formatBRL(resultado.multaValor)}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({formatPercent(resultado.multaAliquota)})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 bg-green-50 dark:bg-green-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total com Multa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                {formatBRL(resultado.totalComMulta)}
              </div>
            </CardContent>
          </Card>

          {resultado.saqueAniversario && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Saque-aniversário (simulação)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-xs text-muted-foreground">Percentual da faixa</div>
                  <div className="text-xl font-semibold">{resultado.saqueAniversario.faixaPercentual}</div>
                  <div className="text-xs text-muted-foreground">
                    Parcela adicional: {formatBRL(resultado.saqueAniversario.parcelaAdicional)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Valor do saque</div>
                  <div className="text-xl font-semibold text-primary">
                    {formatBRL(resultado.saqueAniversario.valorSaque)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Saldo após saque</div>
                  <div className="text-xl font-semibold">
                    {formatBRL(resultado.saqueAniversario.saldoAposSaque)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Como calculamos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <ol className="list-decimal ml-5 space-y-2">
                <li>
                  <strong>Depósito mensal:</strong> salário × alíquota FGTS do contrato
                  {contrato === "domestico" ? " + 3,2% (indenização mensal para doméstico)" : ""}.
                </li>
                <li>
                  <strong>Projeção mensal composta:</strong> somamos os depósitos e aplicamos rendimento
                  mensal ~ <code>[(1+3%)^(1/12)-1] + TR/12</code>.
                </li>
                <li>
                  <strong>13º proporcional (opcional):</strong> salário × (avos/12) × alíquota do contrato.
                </li>
                <li>
                  <strong>Saldo projetado:</strong> saldo inicial + depósitos + rendimento + FGTS do 13º.
                </li>
                <li>
                  <strong>Multa rescisória:</strong> saldo projetado × alíquota selecionada (40%/20%/0%).
                </li>
                <li>
                  <strong>Saque-aniversário (opcional):</strong> aplicamos a faixa (percentual + parcela adicional)
                  sobre o saldo projetado e mostramos o saldo remanescente.
                </li>
              </ol>
              <Notice variant="warning" className="mt-3">
                Simulação estimativa para planejamento. Convenções específicas (ex.: doméstico) podem gerar
                depósitos acessórios e regras operacionais próprias. Para valores oficiais, use o
                aplicativo/portal do FGTS.
              </Notice>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Área dos botões: Logo, Salvar, Exportar PDF */}
      {resultado && (
        <div className="flex gap-2 justify-center flex-wrap">
          <PDFExportButton
            calculatorName="Calculadora de FGTS"
            results={[
              { label: "Tipo de Contrato", value: resultado.tipoContrato },
              { label: "Depósito Mensal FGTS", value: formatBRL(resultado.depositoMensalFgts) },
              { label: "Total de Depósitos", value: formatBRL(resultado.totalDepositos) },
              { label: "Saldo Projetado", value: formatBRL(resultado.saldoProjetado) },
              { label: "Multa Rescisória", value: formatBRL(resultado.multaValor) },
              { label: "Total com Multa", value: formatBRL(resultado.totalComMulta) },
            ]}
            calculator="fgts"
            calculationType="fgts"
            input={{
              salario,
              meses,
              saldoInicial,
              contrato,
              multa,
              considerarRendimento,
              trAA,
              incluir13,
              meses13,
              simularSaque
            }}
            resultData={resultado}
          />
        </div>
      )}
    </div>
  );
}
