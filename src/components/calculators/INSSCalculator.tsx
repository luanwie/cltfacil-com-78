import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Switch } from "@/components/ui/switch";
import { Calculator, RotateCcw, DollarSign, Percent, Gift } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/currency";
import { calcularINSSSync } from "@/lib/tabelas";
import UsageBanner from "@/components/UsageBanner";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useToast } from "@/hooks/use-toast";
import { PDFExportButton } from "@/components/ui/pdf-export-button";

type ResultadoMes = {
  baseMes: string;
  valorINSSMes: string;
  aliquotaEfetivaMes: string;
  faixaMarginalMes: string;
  liquidoAposINSSMes: string;
};

type Resultado13 = {
  base13: string;
  valorINSS13: string;
  aliquotaEfetiva13: string;
  faixaMarginal13: string;
  liquidoAposINSS13: string;
};

type ResultadoGeral = {
  totalINSS: string;
  baseTotalConsiderada: string;
  observacaoTeto: string | null;
};

const TETO_INSS_2025 = 7786.02; // exibição informativa

const INSSCalculator = () => {
  const { toast } = useToast();
  const { isPro, remaining, allowOrRedirect, incrementCount } = useUsageLimit();
  const overLimit = !isPro && (remaining ?? 0) <= 0;

  // Entradas
  const [salario, setSalario] = useState<number | undefined>();
  const [outrasRemuneracoes, setOutrasRemuneracoes] = useState<number | undefined>(0);
  const [incluirDecimo, setIncluirDecimo] = useState<boolean>(false);
  const [valorDecimo, setValorDecimo] = useState<number | undefined>(undefined); // se não informado, usa salário

  // Resultados
  const [resMes, setResMes] = useState<ResultadoMes | null>(null);
  const [res13, setRes13] = useState<Resultado13 | null>(null);
  const [resGeral, setResGeral] = useState<ResultadoGeral | null>(null);

  const canSubmit = !!salario && salario > 0 && !overLimit;

  const calcular = async () => {
    if (!salario || salario <= 0) return;
    
    if (!(await allowOrRedirect())) return;

    // Base do mês = salário + outras remunerações (comissões/variáveis do mês)
    const baseMesNum = (salario ?? 0) + Math.max(0, outrasRemuneracoes ?? 0);
    const rMes = calcularINSSSync(baseMesNum);

    const saidaMes: ResultadoMes = {
      baseMes: formatBRL(baseMesNum),
      valorINSSMes: formatBRL(rMes.valor),
      aliquotaEfetivaMes: formatPercent(rMes.aliquotaEfetiva),
      faixaMarginalMes: formatPercent(rMes.faixaMarginal),
      liquidoAposINSSMes: formatBRL(baseMesNum - rMes.valor),
    };
    setResMes(saidaMes);

    // 13º (se marcado): calculado separadamente (não soma com a base mensal)
    let saida13: Resultado13 | null = null;
    if (incluirDecimo) {
      const base13Num = Math.max(0, (valorDecimo ?? salario));
      const r13 = calcularINSSSync(base13Num);
      saida13 = {
        base13: formatBRL(base13Num),
        valorINSS13: formatBRL(r13.valor),
        aliquotaEfetiva13: formatPercent(r13.aliquotaEfetiva),
        faixaMarginal13: formatPercent(r13.faixaMarginal),
        liquidoAposINSS13: formatBRL(base13Num - r13.valor),
      };
      setRes13(saida13);
    } else {
      setRes13(null);
    }

    // Consolidado
    const totalINSSNum = rMes.valor + (saida13 ? +(saida13.valorINSS13.replace(/[^\d,.-]/g, "").replace(".", "").replace(",", ".")) : 0);
    const baseTotalConsideradaNum = baseMesNum + (incluirDecimo ? (valorDecimo ?? salario) : 0);

    const observacaoTeto =
      baseMesNum >= TETO_INSS_2025
        ? `Atenção: a base mensal atingiu o teto de contribuição (R$ ${TETO_INSS_2025.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}).`
        : null;

    setResGeral({
      totalINSS: formatBRL(totalINSSNum),
      baseTotalConsiderada: formatBRL(baseTotalConsideradaNum),
      observacaoTeto,
    });

    await incrementCount();
  };

  const limpar = () => {
    setSalario(undefined);
    setOutrasRemuneracoes(0);
    setIncluirDecimo(false);
    setValorDecimo(undefined);
    setResMes(null);
    setRes13(null);
    setResGeral(null);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo do INSS (Mês e 13º opcional)
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salario">Salário base do mês (R$)</Label>
              <NumberInput
                id="salario"
                value={salario}
                onChange={setSalario}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
              <p className="text-xs text-muted-foreground">
                Teto previdenciário (2025): R$ {TETO_INSS_2025.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
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
              <p className="text-xs text-muted-foreground">Comissões, adicionais e variáveis do próprio mês</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Incluir cálculo do 13º salário?
              </Label>
              <div className="flex items-center gap-3">
                <Switch checked={incluirDecimo} onCheckedChange={setIncluirDecimo} />
                <span className="text-sm">{incluirDecimo ? "Sim" : "Não"}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                O INSS do 13º é calculado separadamente da base mensal.
              </p>
            </div>

            {incluirDecimo && (
              <div className="space-y-2">
                <Label htmlFor="decimo">Valor do 13º (R$)</Label>
                <NumberInput
                  id="decimo"
                  value={valorDecimo}
                  onChange={setValorDecimo}
                  prefix="R$"
                  decimal
                  min={0}
                  placeholder="Se vazio, usamos o salário"
                />
                <p className="text-xs text-muted-foreground">Se não informar, usamos o salário como base do 13º.</p>
              </div>
            )}
          </div>

          {/* Banner padronizado */}
          <div id="usage-banner">
            <UsageBanner
              remaining={remaining}
              isPro={isPro}
              isLogged={false}
              onGoPro={() => {}}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={calcular} disabled={!canSubmit} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              {overLimit ? "Limite atingido" : "Calcular INSS"}
            </Button>
            <Button variant="outline" onClick={limpar}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {(resMes || res13) && (
        <div className="space-y-4">
          {/* MÊS */}
          {resMes && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Contribuição do Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Base do mês:</span>
                      <span className="font-medium">{resMes.baseMes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">INSS do mês:</span>
                      <span className="text-lg font-bold text-destructive">{resMes.valorINSSMes}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="p-2 rounded bg-background border">
                        <div className="text-xs text-muted-foreground">Alíquota efetiva</div>
                        <div className="font-medium">{resMes.aliquotaEfetivaMes}</div>
                      </div>
                      <div className="p-2 rounded bg-background border">
                        <div className="text-xs text-muted-foreground">Alíquota marginal</div>
                        <div className="font-medium">{resMes.faixaMarginalMes}</div>
                      </div>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <span className="text-sm">Após INSS:</span>
                      <span className="font-medium">{resMes.liquidoAposINSSMes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 13º */}
              {res13 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Contribuição do 13º
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Base 13º:</span>
                        <span className="font-medium">{res13.base13}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">INSS 13º:</span>
                        <span className="text-lg font-bold">{res13.valorINSS13}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="p-2 rounded bg-background border">
                          <div className="text-xs text-muted-foreground">Alíquota efetiva</div>
                          <div className="font-medium">{res13.aliquotaEfetiva13}</div>
                        </div>
                        <div className="p-2 rounded bg-background border">
                          <div className="text-xs text-muted-foreground">Alíquota marginal</div>
                          <div className="font-medium">{res13.faixaMarginal13}</div>
                        </div>
                      </div>
                      <div className="pt-2 flex justify-between">
                        <span className="text-sm">Após INSS (13º):</span>
                        <span className="font-medium">{res13.liquidoAposINSS13}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* CONSOLIDADO */}
          {resGeral && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Resumo Consolidado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="p-3 rounded bg-background border">
                    <div className="text-sm text-muted-foreground">Base total considerada</div>
                    <div className="text-xl font-semibold">{resGeral.baseTotalConsiderada}</div>
                  </div>
                  <div className="p-3 rounded bg-background border">
                    <div className="text-sm text-muted-foreground">INSS total (mês + 13º)</div>
                    <div className="text-xl font-bold text-primary">{resGeral.totalINSS}</div>
                  </div>
                </div>
                {resGeral.observacaoTeto && (
                  <p className="text-xs text-muted-foreground mt-2">{resGeral.observacaoTeto}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Botão Exportar PDF */}
          {(resMes || res13 || resGeral) && (
            <div className="flex justify-center">
              <PDFExportButton
                calculatorName="Calculadora de INSS"
                results={[
                  ...(resMes ? [
                    { label: "Base do Mês", value: resMes.baseMes },
                    { label: "INSS do Mês", value: resMes.valorINSSMes },
                    { label: "Alíquota Efetiva (Mês)", value: resMes.aliquotaEfetivaMes },
                    { label: "Líquido após INSS (Mês)", value: resMes.liquidoAposINSSMes },
                  ] : []),
                  ...(res13 ? [
                    { label: "Base 13º", value: res13.base13 },
                    { label: "INSS 13º", value: res13.valorINSS13 },
                    { label: "Alíquota Efetiva (13º)", value: res13.aliquotaEfetiva13 },
                    { label: "Líquido após INSS (13º)", value: res13.liquidoAposINSS13 },
                  ] : []),
                  ...(resGeral ? [
                    { label: "Base Total Considerada", value: resGeral.baseTotalConsiderada },
                    { label: "INSS Total", value: resGeral.totalINSS },
                  ] : [])
                ]}
              />
            </div>
          )}

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
                    <p className="font-medium">Base mensal</p>
                    <p className="text-sm text-muted-foreground">
                      Base do mês = salário + outras remunerações (do próprio mês).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Faixas progressivas</p>
                    <p className="text-sm text-muted-foreground">
                      Aplicamos as faixas oficiais do INSS (cálculo progressivo) via biblioteca interna.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">13º salário</p>
                    <p className="text-sm text-muted-foreground">
                      O INSS do 13º é calculado **separadamente** da base mensal (sem somar bases).
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

export default INSSCalculator;
