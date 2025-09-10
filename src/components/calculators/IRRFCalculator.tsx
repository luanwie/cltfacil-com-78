import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, RotateCcw, DollarSign, Percent, Scale, Sparkles } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/currency";
import { calcularIRRFSync, calcularINSSSync } from "@/lib/tabelas";

import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useToast } from "@/hooks/use-toast";
import { PDFExportButton } from "@/components/ui/pdf-export-button";
import SaveCalcButton from "@/components/SaveCalcButton";

const DEDUCAO_SIMPLIFICADA_MENSAL = 528.0; // regra vigente (abatimento fixo mensal)

type ResultadoBasico = {
  basePosINSS: string;
  totalDeducoes: string;
  baseCalculoFinal: string;
  valorIRRF: string;
  aliquotaEfetiva: string;
  valorLiquido: string;
  faixaMarginal?: string; // opcional (só exibimos se disponível)
};

type ResultadoComparativo = {
  completo: ResultadoBasico;
  simplificado: ResultadoBasico;
  melhor: "completo" | "simplificado" | null;
  detalheSimplificado: string;
};

type EntradaModo = "posINSS" | "bruto";

const IRRFCalculator = () => {
  const { isPro, remaining, allowOrRedirect, incrementCount } = useUsageLimit();
  const { toast } = useToast();
  const overLimit = !isPro && (remaining ?? 0) <= 0;

  // -------- Entradas --------
  const [modoEntrada, setModoEntrada] = useState<EntradaModo>("posINSS");

  // modo: base após INSS
  const [basePosINSS, setBasePosINSS] = useState<number | undefined>();

  // modo: salário bruto (calculamos INSS automaticamente)
  const [salarioBruto, setSalarioBruto] = useState<number | undefined>();
  const [outrasRemuneracoes, setOutrasRemuneracoes] = useState<number | undefined>(0);

  // deduções
  const [dependentes, setDependentes] = useState<number | undefined>(0);
  const [pensao, setPensao] = useState<number | undefined>(0);
  const [outrasDeducoes, setOutrasDeducoes] = useState<number | undefined>(0); // PGBL, previdência complementar etc.

  // resultado
  const [resultado, setResultado] = useState<ResultadoComparativo | null>(null);

  // -------- Helpers --------
  const getBasePosINSS = () => {
    if (modoEntrada === "posINSS") {
      return Math.max(0, basePosINSS || 0);
    }
    // bruto -> calcula INSS automaticamente
    const baseBruta = Math.max(0, (salarioBruto || 0) + (outrasRemuneracoes || 0));
    const inss = calcularINSSSync(baseBruta);
    return Math.max(0, baseBruta - inss.valor);
  };

  const calcular = async () => {
    const baseAposINSSNum = getBasePosINSS();
    if (baseAposINSSNum <= 0) return;

    if (!(await allowOrRedirect())) return;

    const dep = Math.max(0, dependentes || 0);
    const pens = Math.max(0, pensao || 0);
    const outras = Math.max(0, outrasDeducoes || 0);

    // -------- Regime COMPLETO (deduções legais) --------
    // a função já desconta dependentes e "pensão" do valor informado pós-INSS.
    // aqui somamos pensão + outras deduções no parâmetro de pensão para abatê-las.
    const calcCompleto = calcularIRRFSync(baseAposINSSNum, dep, pens + outras);

    const resCompleto: ResultadoBasico = {
      basePosINSS: formatBRL(baseAposINSSNum),
      totalDeducoes: formatBRL(calcCompleto.totalDeducoes), // (dep*valor + pens+outras)
      baseCalculoFinal: formatBRL(calcCompleto.baseCalculoFinal),
      valorIRRF: formatBRL(calcCompleto.valor),
      aliquotaEfetiva: formatPercent(calcCompleto.aliquotaEfetiva),
      valorLiquido: formatBRL(baseAposINSSNum - calcCompleto.valor),
      // faixaMarginal não fornecida por calcularIRRFSync – deixamos indefinido
    };

    // -------- Regime SIMPLIFICADO (abatimento fixo R$ 528/mês) --------
    const baseSimplificada = Math.max(0, baseAposINSSNum - DEDUCAO_SIMPLIFICADA_MENSAL);
    const calcSimplificado = calcularIRRFSync(baseSimplificada, 0, 0);

    const resSimplificado: ResultadoBasico = {
      basePosINSS: formatBRL(baseAposINSSNum),
      totalDeducoes: formatBRL(DEDUCAO_SIMPLIFICADA_MENSAL),
      baseCalculoFinal: formatBRL(calcSimplificado.baseCalculoFinal),
      valorIRRF: formatBRL(calcSimplificado.valor),
      aliquotaEfetiva: formatPercent(calcSimplificado.aliquotaEfetiva),
      valorLiquido: formatBRL(baseAposINSSNum - calcSimplificado.valor),
      // faixaMarginal indefinida aqui também
    };

    // -------- Melhor regime --------
    const melhor =
      calcSimplificado.valor < calcCompleto.valor
        ? "simplificado"
        : calcSimplificado.valor > calcCompleto.valor
        ? "completo"
        : null;

    setResultado({
      completo: resCompleto,
      simplificado: resSimplificado,
      melhor,
      detalheSimplificado: `Aplicado abatimento fixo de ${formatBRL(
        DEDUCAO_SIMPLIFICADA_MENSAL
      )} (regra simplificada mensal).`,
    });

    await incrementCount();
  };

  const limpar = () => {
    setModoEntrada("posINSS");
    setBasePosINSS(undefined);
    setSalarioBruto(undefined);
    setOutrasRemuneracoes(0);
    setDependentes(0);
    setPensao(0);
    setOutrasDeducoes(0);
    setResultado(null);
  };

  const canSubmit =
    !overLimit &&
    ((modoEntrada === "posINSS" && !!basePosINSS && basePosINSS > 0) ||
      (modoEntrada === "bruto" && !!salarioBruto && salarioBruto > 0));

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo do IRRF (Comparativo: Completo × Simplificado)
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Modo de entrada */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="modo">Modo de entrada</Label>
              <Select value={modoEntrada} onValueChange={(v: EntradaModo) => setModoEntrada(v)}>
                <SelectTrigger id="modo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="posINSS">Informarei a base após INSS</SelectItem>
                  <SelectItem value="bruto">Informarei salário bruto (calcular INSS)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {modoEntrada === "posINSS" ? (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="base-pos-inss">Base após INSS (R$)</Label>
                <NumberInput
                  id="base-pos-inss"
                  value={basePosINSS}
                  onChange={setBasePosINSS}
                  prefix="R$"
                  decimal
                  min={0}
                  placeholder="0,00"
                />
                <p className="text-xs text-muted-foreground">Salário bruto - INSS</p>
              </div>
            ) : (
              <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bruto">Salário bruto do mês (R$)</Label>
                  <NumberInput
                    id="bruto"
                    value={salarioBruto}
                    onChange={setSalarioBruto}
                    prefix="R$"
                    decimal
                    min={0}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variaveis">Outras remunerações do mês (R$)</Label>
                  <NumberInput
                    id="variaveis"
                    value={outrasRemuneracoes}
                    onChange={setOutrasRemuneracoes}
                    prefix="R$"
                    decimal
                    min={0}
                    placeholder="0,00"
                  />
                  <p className="text-xs text-muted-foreground">Comissões, adicionais, etc.</p>
                </div>
              </div>
            )}
          </div>

          {/* Deduções legais (para o regime completo) */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dependentes">Dependentes</Label>
              <NumberInput
                id="dependentes"
                value={dependentes}
                onChange={setDependentes}
                min={0}
                max={20}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">R$ 189,59 por dependente</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pensao">Pensão alimentícia (R$)</Label>
              <NumberInput
                id="pensao"
                value={pensao}
                onChange={setPensao}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outras">Outras deduções legais (R$)</Label>
              <NumberInput
                id="outras"
                value={outrasDeducoes}
                onChange={setOutrasDeducoes}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
              <p className="text-xs text-muted-foreground">Ex.: previdência complementar (PGBL)</p>
            </div>
          </div>

          {/* Banner de uso removido para simplificar */}

          <div className="flex gap-2">
            <Button onClick={calcular} disabled={!canSubmit} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              {overLimit ? "Limite atingido" : "Calcular IRRF"}
            </Button>
            <Button variant="outline" onClick={limpar}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {resultado && (
        <div className="space-y-6">
          {/* Comparativo lado a lado */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className={resultado.melhor === "completo" ? "border-primary/40 bg-primary/5" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Regime Completo (deduções)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Base após INSS:</span>
                    <span className="font-medium">{resultado.completo.basePosINSS}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Deduções:</span>
                    <span className="font-medium">{resultado.completo.totalDeducoes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Base tributável:</span>
                    <span className="font-medium">{resultado.completo.baseCalculoFinal}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-2 rounded bg-background border">
                      <div className="text-xs text-muted-foreground">Alíquota efetiva</div>
                      <div className="font-medium">{resultado.completo.aliquotaEfetiva}</div>
                    </div>
                    {/* Só mostra a marginal se existir */}
                    {resultado.completo.faixaMarginal && (
                      <div className="p-2 rounded bg-background border">
                        <div className="text-xs text-muted-foreground">Alíquota marginal</div>
                        <div className="font-medium">{resultado.completo.faixaMarginal}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-2">
                    <span className="text-sm">IRRF devido:</span>
                    <span className="text-lg font-bold text-destructive">
                      {resultado.completo.valorIRRF}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Líquido:</span>
                    <span className="font-semibold">{resultado.completo.valorLiquido}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={resultado.melhor === "simplificado" ? "border-primary/40 bg-primary/5" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Regime Simplificado (abatimento R$ 528)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Base após INSS:</span>
                    <span className="font-medium">{resultado.simplificado.basePosINSS}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Deduções:</span>
                    <span className="font-medium">{resultado.simplificado.totalDeducoes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Base tributável:</span>
                    <span className="font-medium">{resultado.simplificado.baseCalculoFinal}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-2 rounded bg-background border">
                      <div className="text-xs text-muted-foreground">Alíquota efetiva</div>
                      <div className="font-medium">{resultado.simplificado.aliquotaEfetiva}</div>
                    </div>
                    {resultado.simplificado.faixaMarginal && (
                      <div className="p-2 rounded bg-background border">
                        <div className="text-xs text-muted-foreground">Alíquota marginal</div>
                        <div className="font-medium">{resultado.simplificado.faixaMarginal}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-2">
                    <span className="text-sm">IRRF devido:</span>
                    <span className="text-lg font-bold text-destructive">
                      {resultado.simplificado.valorIRRF}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Líquido:</span>
                    <span className="font-semibold">{resultado.simplificado.valorLiquido}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{resultado.detalheSimplificado}</p>
              </CardContent>
            </Card>
          </div>

          {/* Destaque do regime mais vantajoso */}
          {resultado.melhor && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">
                  Melhor opção:{" "}
                  {resultado.melhor === "completo"
                    ? "Regime Completo (deduções)"
                    : "Regime Simplificado (R$ 528)"}
                </CardTitle>
              </CardHeader>
            </Card>
          )}

          {/* Botões: Logo, Salvar, Exportar PDF */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <PDFExportButton
              calculatorName="Calculadora de IRRF"
              results={[
                { label: "REGIME COMPLETO", value: "" },
                { label: "Base após INSS", value: resultado.completo.basePosINSS },
                { label: "Total Deduções", value: resultado.completo.totalDeducoes },
                { label: "Base Tributável", value: resultado.completo.baseCalculoFinal },
                { label: "IRRF Devido", value: resultado.completo.valorIRRF },
                { label: "Alíquota Efetiva", value: resultado.completo.aliquotaEfetiva },
                { label: "Valor Líquido", value: resultado.completo.valorLiquido },
                { label: "", value: "" },
                { label: "REGIME SIMPLIFICADO", value: "" },
                { label: "Base após INSS", value: resultado.simplificado.basePosINSS },
                { label: "Total Deduções", value: resultado.simplificado.totalDeducoes },
                { label: "Base Tributável", value: resultado.simplificado.baseCalculoFinal },
                { label: "IRRF Devido", value: resultado.simplificado.valorIRRF },
                { label: "Alíquota Efetiva", value: resultado.simplificado.aliquotaEfetiva },
                { label: "Valor Líquido", value: resultado.simplificado.valorLiquido },
                { label: "", value: "" },
                { label: "MELHOR OPÇÃO", value: resultado.melhor === "completo" ? "Regime Completo" : "Regime Simplificado" },
              ]}
              calculator="irrf"
              calculationType="irrf"
              input={{
                modoEntrada,
                basePosINSS,
                salarioBruto,
                outrasRemuneracoes,
                dependentes,
                pensao,
                outrasDeducoes
              }}
              resultData={resultado}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IRRFCalculator;
