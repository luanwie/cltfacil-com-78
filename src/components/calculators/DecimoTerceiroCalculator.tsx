import React, { useRef, useState } from "react";
import { Calculator, RotateCcw, DollarSign, Calendar, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import Notice from "@/components/ui/notice";
import { formatBRL, formatPercent } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { PDFExportButton } from "@/components/ui/pdf-export-button";
import SaveCalcButton from "@/components/SaveCalcButton";
import { useCalculationReload } from "@/hooks/useCalculationReload";

type Modo = "meses" | "mes_a_mes";

type Resultado = {
  mesesValidos: number;
  avos: number;                // 0..1
  avosFracao: string;          // ex: "8/12"
  avosPercentual: string;      // ex: "66,67%"
  baseCalculo: string;         // BRL
  totalBruto: string;          // BRL
  primeiraParcela: string;     // BRL
  segundaParcela: string;      // BRL
};

const NOMES_MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

// util p/ % com 2 casas, compatível com formatPercent do projeto
const toPercentStr = (val: number) => formatPercent(val);

const DecimoTerceiroCalculator = () => {
  const { toast } = useToast();

  // Gate global (4 grátis x PRO ilimitado)
  const { isPro, remaining, allowOrRedirect, incrementCount } = useUsageLimit();
  const overLimit = !isPro && (remaining ?? 0) <= 0;

  const [modo, setModo] = useState<Modo>("meses");

  const [salarioBase, setSalarioBase] = useState<number | undefined>();
  const [mediaVariaveis, setMediaVariaveis] = useState<number | undefined>();

  // MODO "meses"
  const [mesesTrabalhados, setMesesTrabalhados] = useState<number | undefined>();

  // MODO "mes_a_mes" (regra 15 dias -> “conta o mês”)
  const [mesElegivel, setMesElegivel] = useState<boolean[]>(
    Array.from({ length: 12 }, () => false)
  );

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const countingRef = useRef(false); // evita 2 cliques contarem 2x

  // Hook para recarregar dados salvos
  useCalculationReload((inputs) => {
    if (inputs.modo !== undefined) setModo(inputs.modo);
    if (inputs.salarioBase !== undefined) setSalarioBase(inputs.salarioBase);
    if (inputs.mediaVariaveis !== undefined) setMediaVariaveis(inputs.mediaVariaveis);
    if (inputs.mesesTrabalhados !== undefined) setMesesTrabalhados(inputs.mesesTrabalhados);
    if (inputs.mesElegivel !== undefined) setMesElegivel(inputs.mesElegivel);
  }, setResultado);

  const handleMesesChange = (value: number | undefined) => {
    if (value !== undefined) {
      const mesesValidados = Math.trunc(Math.min(12, Math.max(0, value)));
      setMesesTrabalhados(mesesValidados);
    } else {
      setMesesTrabalhados(undefined);
    }
  };

  const toggleMes = (idx: number) => {
    setMesElegivel((prev) => {
      const cp = [...prev];
      cp[idx] = !cp[idx];
      return cp;
    });
  };

  function calcularInterno(): Resultado | null {
    if (!salarioBase || salarioBase <= 0) return null;

    const base = (salarioBase ?? 0) + (mediaVariaveis ?? 0);

    let mesesValidos = 0;
    if (modo === "meses") {
      mesesValidos = Math.trunc(Math.min(12, Math.max(0, mesesTrabalhados ?? 0)));
    } else {
      // soma checkboxes mês a mês (cada mês marcado conta 1/12)
      mesesValidos = mesElegivel.reduce((acc, v) => acc + (v ? 1 : 0), 0);
    }

    const avos = mesesValidos / 12;
    const totalBrutoNum = base * avos;
    const primeiraParcelaNum = totalBrutoNum / 2;
    const segundaParcelaNum = totalBrutoNum - primeiraParcelaNum;

    return {
      mesesValidos,
      avos,
      avosFracao: `${mesesValidos}/12`,
      avosPercentual: toPercentStr(avos),
      baseCalculo: formatBRL(base),
      totalBruto: formatBRL(totalBrutoNum),
      primeiraParcela: formatBRL(primeiraParcelaNum),
      segundaParcela: formatBRL(segundaParcelaNum),
    };
  }

  async function handleCalcular() {
    // Gate novo
    const ok = await allowOrRedirect();
    if (!ok) return;

    const res = calcularInterno();
    if (!res) {
      toast({
        title: "Preencha os campos",
        description: "Informe o salário base (e, se quiser, a média de variáveis).",
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
    setModo("meses");
    setSalarioBase(undefined);
    setMediaVariaveis(undefined);
    setMesesTrabalhados(undefined);
    setMesElegivel(Array.from({ length: 12 }, () => false));
    setResultado(null);
  }

  const botaoDisabled = !salarioBase || salarioBase <= 0 || overLimit;

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Calculadora de 13º Salário
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Notice variant="info">
            Calcule o 13º com base na regra dos <strong>1/12 por mês</strong>. Considere mês completo
            quando houver <strong>15 dias</strong> trabalhados no mês. A base é <strong>salário + média de
            variáveis</strong> (comissão, HE, adicionais, etc.). Este cálculo retorna o <strong>valor bruto</strong>
            (sem INSS/IRRF).
          </Notice>

          {/* Modo de apuração */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Modo de apuração</Label>
              <div className="flex gap-2">
                <Button
                  variant={modo === "meses" ? "default" : "outline"}
                  onClick={() => setModo("meses")}
                >
                  Meses (0–12)
                </Button>
                <Button
                  variant={modo === "mes_a_mes" ? "default" : "outline"}
                  onClick={() => setModo("mes_a_mes")}
                >
                  Mês a mês
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                “Mês a mês” é útil para desligamentos no ano ou afastamentos: marque os meses com 15+ dias.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salario-base">Salário base mensal (R$)</Label>
              <NumberInput
                id="salario-base"
                value={salarioBase}
                onChange={setSalarioBase}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="media-variaveis">Média de variáveis (R$, opcional)</Label>
              <NumberInput
                id="media-variaveis"
                value={mediaVariaveis}
                onChange={setMediaVariaveis}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
              <p className="text-xs text-muted-foreground">Ex.: comissões, HE, adicionais habituais.</p>
            </div>
          </div>

          {/* Entradas específicas por modo */}
          {modo === "meses" ? (
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="meses-trabalhados">
                  Meses válidos no ano (0–12)
                  <span className="text-sm text-muted-foreground ml-2">
                    (1 mês = trabalhou 15+ dias)
                  </span>
                </Label>
                <NumberInput
                  id="meses-trabalhados"
                  value={mesesTrabalhados}
                  onChange={handleMesesChange}
                  min={0}
                  max={12}
                  placeholder="0"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Meses com 15+ dias trabalhados</Label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {NOMES_MESES.map((m, i) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMes(i)}
                    className={`flex items-center justify-center gap-2 border rounded-md h-10 ${
                      mesElegivel[i] ? "bg-primary/10 border-primary/40" : "bg-background"
                    }`}
                    aria-pressed={mesElegivel[i]}
                  >
                    {mesElegivel[i] ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">{m}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Dica: marque apenas os meses trabalhados (ou com afastamento remunerado que conte para a média, se aplicável na sua CCT).
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleCalcular} disabled={botaoDisabled} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              {overLimit ? "Limite atingido" : "Calcular 13º"}
            </Button>
            <Button variant="outline" onClick={limparFormulario}>
              <RotateCcw className="w-4 h-4" />
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
                  <Calendar className="w-4 h-4" />
                  Avos / Percentual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Meses válidos:</span>
                    <span className="font-medium">{resultado.mesesValidos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avos:</span>
                    <span className="font-medium">{resultado.avosFracao}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Percentual:</span>
                    <span className="font-medium">{resultado.avosPercentual}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Base de Cálculo (Salário + Variáveis)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{resultado.baseCalculo}</div>
                <p className="text-sm text-muted-foreground">Cálculo bruto (sem INSS/IRRF).</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Valor do 13º
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-4">{resultado.totalBruto}</div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="p-3 rounded-lg bg-background border">
                  <div className="text-sm text-muted-foreground">1ª parcela (50%)</div>
                  <div className="text-xl font-semibold">{resultado.primeiraParcela}</div>
                </div>
                <div className="p-3 rounded-lg bg-background border">
                  <div className="text-sm text-muted-foreground">2ª parcela (50%)</div>
                  <div className="text-xl font-semibold">{resultado.segundaParcela}</div>
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
                    <p className="font-medium">Apuração dos avos</p>
                    <p className="text-sm text-muted-foreground">
                      1/12 por mês válido (15+ dias). Resultado: {resultado.avosFracao} ({resultado.avosPercentual}).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <p className="font-medium">Base de cálculo</p>
                    <p className="text-sm text-muted-foreground">Salário + média de variáveis = {resultado.baseCalculo}.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <p className="font-medium">Valor do 13º</p>
                    <p className="text-sm text-muted-foreground">
                      Base × avos = {resultado.totalBruto}. Pagamento em 2 parcelas de {resultado.primeiraParcela} cada.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-accent rounded-lg">
                <p className="text-sm text-accent-foreground">
                  <strong>Observações rápidas:</strong> Parcelas costumam ocorrer até <em>30/11</em> (1ª)
                  e <em>20/12</em> (2ª). Descontos de INSS/IRRF incidem na 2ª, quando há. Regras específicas
                  podem variar por CCT/ACT, especialmente na composição de “variáveis”.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Área dos botões: Logo, Salvar, Exportar PDF */}
      {resultado && (
        <div className="flex gap-2 justify-center flex-wrap">
          <PDFExportButton
            calculatorName="Calculadora de 13º Salário"
            results={[
              { label: "Meses Válidos", value: `${resultado.mesesValidos} meses` },
              { label: "Avos", value: resultado.avosFracao },
              { label: "Base de Cálculo", value: resultado.baseCalculo },
              { label: "Valor Bruto Total", value: resultado.totalBruto },
              { label: "Primeira Parcela", value: resultado.primeiraParcela },
              { label: "Segunda Parcela", value: resultado.segundaParcela },
            ]}
            calculator="decimo_terceiro"
            calculationType="decimo_terceiro"
            input={{
              modo,
              salarioBase,
              mediaVariaveis,
              mesesTrabalhados,
              mesElegivel
            }}
            resultData={resultado}
          />
        </div>
      )}
    </div>
  );
};

export default DecimoTerceiroCalculator;
