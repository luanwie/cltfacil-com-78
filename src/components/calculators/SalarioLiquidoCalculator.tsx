import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Calculator, RotateCcw, DollarSign, Percent, Wallet } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/currency";
import { calcularINSSSync, calcularIRRFSync } from "@/lib/tabelas";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useToast } from "@/hooks/use-toast";
import { PDFExportButton } from "@/components/ui/pdf-export-button";
import SaveCalcButton from "@/components/SaveCalcButton";

type Resultado = {
  // bases
  salarioBruto: string;
  outrosProventos: string;
  brutoTotal: string;
  baseINSS: string;
  baseIRRF: string;

  // descontos obrigatórios
  inssValor: string;
  inssAliquotaEfetiva: string;
  irrfValor: string;
  irrfAliquotaEfetiva: string;

  // outros descontos
  descontoVT: string;
  descontoVRVA: string;
  descontoPlano: string;
  outrosDescontos: string;

  // totais
  totalDescontos: string;
  salarioLiquido: string;
  percentualLiquido: string;
};

const SalarioLiquidoCalculator = () => {
  const { isPro, remaining, allowOrRedirect, incrementCount } = useUsageLimit();
  const { toast } = useToast();
  const overLimit = !isPro && (remaining ?? 0) <= 0;

  // ---- Entradas principais
  const [salarioBruto, setSalarioBruto] = useState<number | undefined>();
  const [outrosProventos, setOutrosProventos] = useState<number | undefined>(0);

  // ---- IRRF
  const [dependentes, setDependentes] = useState<number | undefined>(0);
  const [pensaoAlimenticia, setPensaoAlimenticia] = useState<number | undefined>(0);

  // ---- Descontos facultativos
  const [custoValeTransporte, setCustoValeTransporte] = useState<number | undefined>(0); // empresa pode descontar até 6% do bruto total
  const [coparticipacaoVRVA, setCoparticipacaoVRVA] = useState<number | undefined>(0);  // VA/VR (se houver desconto do empregado)
  const [planoSaude, setPlanoSaude] = useState<number | undefined>(0);                 // mensalidade/coparticipação
  const [outrosDescontos, setOutrosDescontos] = useState<number | undefined>(0);       // qualquer outro desconto em folha

  const [resultado, setResultado] = useState<Resultado | null>(null);

  const calcular = async () => {
    if (!salarioBruto || salarioBruto <= 0) return;

    if (!(await allowOrRedirect())) return;

    // Normalizações
    const deps = Math.max(0, dependentes || 0);
    const pensao = Math.max(0, pensaoAlimenticia || 0);
    const proventos = Math.max(0, outrosProventos || 0);

    const vtCusto = Math.max(0, custoValeTransporte || 0);
    const vrva = Math.max(0, coparticipacaoVRVA || 0);
    const plano = Math.max(0, planoSaude || 0);
    const outros = Math.max(0, outrosDescontos || 0);

    // ---- BRUTO TOTAL (base para INSS)
    const brutoTotal = salarioBruto + proventos;

    // ---- INSS (progressivo por faixas) sobre o bruto total
    const inss = calcularINSSSync(brutoTotal);
    const baseIRRFnum = brutoTotal - inss.valor;

    // ---- IRRF (após INSS) com deduções legais
    const irrf = calcularIRRFSync(baseIRRFnum, deps, pensao);

    // ---- Vale-transporte: limite legal de 6% do bruto total
    const maxVT = brutoTotal * 0.06;
    const descontoVTnum = Math.min(maxVT, vtCusto);

    // ---- Descontos facultativos (conforme política da empresa)
    const descontoVRVAnum = vrva;
    const descontoPlAnonum = plano;

    // ---- Totais
    const totalDescontosNum = inss.valor + irrf.valor + descontoVTnum + descontoVRVAnum + descontoPlAnonum + outros;
    const liquidoNum = brutoTotal - totalDescontosNum;

    await incrementCount();

    setResultado({
      salarioBruto: formatBRL(salarioBruto),
      outrosProventos: formatBRL(proventos),
      brutoTotal: formatBRL(brutoTotal),
      baseINSS: formatBRL(brutoTotal),
      baseIRRF: formatBRL(baseIRRFnum),

      inssValor: formatBRL(inss.valor),
      inssAliquotaEfetiva: formatPercent(inss.aliquotaEfetiva),
      irrfValor: formatBRL(irrf.valor),
      irrfAliquotaEfetiva: formatPercent(irrf.aliquotaEfetiva),

      descontoVT: formatBRL(descontoVTnum),
      descontoVRVA: formatBRL(descontoVRVAnum),
      descontoPlano: formatBRL(descontoPlAnonum),
      outrosDescontos: formatBRL(outros),

      totalDescontos: formatBRL(totalDescontosNum),
      salarioLiquido: formatBRL(liquidoNum),
      percentualLiquido: formatPercent(liquidoNum / brutoTotal),
    });
  };

  const limpar = () => {
    setSalarioBruto(undefined);
    setOutrosProventos(0);
    setDependentes(0);
    setPensaoAlimenticia(0);
    setCustoValeTransporte(0);
    setCoparticipacaoVRVA(0);
    setPlanoSaude(0);
    setOutrosDescontos(0);
    setResultado(null);
  };

  const disabled = !salarioBruto || salarioBruto <= 0 || overLimit;

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Dados para Cálculo
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Linha 1 - Proventos */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salario-bruto">Salário bruto mensal (R$)</Label>
              <NumberInput
                id="salario-bruto"
                value={salarioBruto}
                onChange={setSalarioBruto}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outros-proventos">Outros proventos (variáveis) (R$)</Label>
              <NumberInput
                id="outros-proventos"
                value={outrosProventos}
                onChange={setOutrosProventos}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
              <p className="text-xs text-muted-foreground">
                Comissões, adicionais, HE etc. (que integrem a base)
              </p>
            </div>
          </div>

          {/* Linha 2 - IRRF */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dependentes">Dependentes para IR</Label>
              <NumberInput
                id="dependentes"
                value={dependentes}
                onChange={setDependentes}
                min={0}
                max={20}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pensao">Pensão alimentícia (R$)</Label>
              <NumberInput
                id="pensao"
                value={pensaoAlimenticia}
                onChange={setPensaoAlimenticia}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Linha 3 - Descontos facultativos */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vale-transporte">Custo vale-transporte (R$)</Label>
              <NumberInput
                id="vale-transporte"
                value={custoValeTransporte}
                onChange={setCustoValeTransporte}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
              <p className="text-xs text-muted-foreground">Desconto limitado a 6% do bruto total</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vrva">Coparticipação VA/VR (R$)</Label>
              <NumberInput
                id="vrva"
                value={coparticipacaoVRVA}
                onChange={setCoparticipacaoVRVA}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plano">Plano de saúde (R$)</Label>
              <NumberInput
                id="plano"
                value={planoSaude}
                onChange={setPlanoSaude}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outros-descontos">Outros descontos (R$)</Label>
              <NumberInput
                id="outros-descontos"
                value={outrosDescontos}
                onChange={setOutrosDescontos}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={calcular} disabled={disabled} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              {overLimit ? "Limite atingido" : "Calcular Salário Líquido"}
            </Button>
            <Button variant="outline" onClick={limpar}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {resultado && (
        <div className="space-y-4">
          {/* Bases e proventos */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Bruto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{resultado.salarioBruto}</div>
                <p className="text-xs text-muted-foreground">Salário contratual</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Outros proventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{resultado.outrosProventos}</div>
                <p className="text-xs text-muted-foreground">Variáveis que integram a base</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Bruto total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-primary">{resultado.brutoTotal}</div>
                <p className="text-xs text-muted-foreground">Base para INSS</p>
              </CardContent>
            </Card>
          </div>

          {/* INSS / IRRF */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  INSS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{resultado.inssValor}</div>
                <p className="text-xs text-muted-foreground">
                  Base: {resultado.baseINSS} • Alíquota efetiva: {resultado.inssAliquotaEfetiva}
                </p>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  IRRF
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{resultado.irrfValor}</div>
                <p className="text-xs text-muted-foreground">
                  Base após INSS: {resultado.baseIRRF} • Efetiva: {resultado.irrfAliquotaEfetiva}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Descontos facultativos */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Vale-Transporte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{resultado.descontoVT}</div>
                <p className="text-xs text-muted-foreground">Limite: 6% do bruto</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">VA/VR (coparticipação)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{resultado.descontoVRVA}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Plano de saúde</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{resultado.descontoPlano}</div>
              </CardContent>
            </Card>
          </div>

          {/* Total / Líquido */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Salário Líquido Final
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">{resultado.salarioLiquido}</div>
                  <p className="text-sm text-muted-foreground">{resultado.percentualLiquido} do bruto total</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bruto total:</span>
                    <span className="font-medium">{resultado.brutoTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Descontos (INSS + IRRF + VT + outros):</span>
                    <span className="font-medium">-{resultado.totalDescontos}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-medium">
                    <span>Líquido:</span>
                    <span className="text-primary">{resultado.salarioLiquido}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Explicação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Como Calculamos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
                  <div>
                    <p className="font-medium">Bruto total e base do INSS</p>
                    <p className="text-sm text-muted-foreground">
                      Bruto total = salário + proventos variáveis. INSS calculado progressivamente sobre o bruto total.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <p className="font-medium">Base do IRRF</p>
                    <p className="text-sm text-muted-foreground">
                      Base IRRF = (Bruto total - INSS) com deduções legais de dependentes e pensão alimentícia.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <p className="font-medium">Descontos facultativos</p>
                    <p className="text-sm text-muted-foreground">
                      Vale-transporte (até 6% do bruto), VA/VR, plano de saúde e outros descontos informados.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">4</div>
                  <div>
                    <p className="font-medium">Líquido</p>
                    <p className="text-sm text-muted-foreground">
                      Líquido = Bruto total − (INSS + IRRF + VT + demais descontos).
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Área dos botões: Logo, Salvar, Exportar PDF */}
      {resultado && (
        <div className="flex justify-center">
          <PDFExportButton
            calculatorName="Calculadora de Salário Líquido"
            results={[
              { label: "Salário Bruto", value: resultado.salarioBruto },
              { label: "Outros Proventos", value: resultado.outrosProventos },
              { label: "Bruto Total", value: resultado.brutoTotal },
              { label: "INSS", value: resultado.inssValor },
              { label: "IRRF", value: resultado.irrfValor },
              { label: "Vale Transporte", value: resultado.descontoVT },
              { label: "Total Descontos", value: resultado.totalDescontos },
              { label: "Salário Líquido", value: resultado.salarioLiquido },
            ]}
            calculator="salario_liquido"
            calculationType="salario_liquido"
            input={{
              salarioBruto,
              outrosProventos,
              dependentes,
              pensaoAlimenticia,
              custoValeTransporte,
              coparticipacaoVRVA,
              planoSaude,
              outrosDescontos
            }}
            resultData={resultado}
          />
        </div>
      )}
    </div>
  );
};

export default SalarioLiquidoCalculator;
