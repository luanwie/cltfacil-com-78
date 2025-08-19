import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Calculator, RotateCcw, DollarSign, Percent } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/currency";
import { calcularIRRFSync } from "@/lib/tabelas";

const IRRFCalculator = () => {
  const [basePosINSS, setBasePosINSS] = useState<number | undefined>();
  const [dependentes, setDependentes] = useState<number | undefined>(0);
  const [pensao, setPensao] = useState<number | undefined>(0);

  const calcular = () => {
    if (!basePosINSS || basePosINSS <= 0) return null;

    const dependentesValidados = Math.max(0, dependentes || 0);
    const pensaoValidada = Math.max(0, pensao || 0);
    
    const resultado = calcularIRRFSync(basePosINSS, dependentesValidados, pensaoValidada);
    
    return {
      basePosINSS: formatBRL(basePosINSS),
      totalDeducoes: formatBRL(resultado.totalDeducoes),
      baseCalculoFinal: formatBRL(resultado.baseCalculoFinal),
      valorIRRF: formatBRL(resultado.valor),
      aliquotaEfetiva: formatPercent(resultado.aliquotaEfetiva),
      valorLiquido: formatBRL(basePosINSS - resultado.valor)
    };
  };

  const resultado = calcular();

  const limpar = () => {
    setBasePosINSS(undefined);
    setDependentes(0);
    setPensao(0);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo do IRRF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
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
            </div>

            <div className="space-y-2 md:col-span-2">
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
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {}}
              disabled={!basePosINSS || basePosINSS <= 0}
              className="flex-1"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calcular IRRF
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
                  <DollarSign className="w-4 h-4" />
                  Deduções
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-muted-foreground">
                  {resultado.totalDeducoes}
                </div>
                <p className="text-sm text-muted-foreground">
                  Dependentes + pensão
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Base Tributável
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {resultado.baseCalculoFinal}
                </div>
                <p className="text-sm text-muted-foreground">
                  Para cálculo do IR
                </p>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  IRRF Devido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-destructive">
                  {resultado.valorIRRF}
                </div>
                <p className="text-sm text-muted-foreground">
                  {resultado.aliquotaEfetiva} efetiva
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Resumo Final
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Base após INSS:</span>
                  <span className="font-medium">{resultado.basePosINSS}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span className="text-sm">IRRF:</span>
                  <span className="font-medium">-{resultado.valorIRRF}</span>
                </div>
                <hr />
                <div className="flex justify-between font-medium">
                  <span>Valor líquido:</span>
                  <span className="text-primary">{resultado.valorLiquido}</span>
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
                    <p className="font-medium">Deduções Aplicáveis</p>
                    <p className="text-sm text-muted-foreground">Dependentes (R$ 189,59 cada) + pensão alimentícia</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <p className="font-medium">Base Tributável</p>
                    <p className="text-sm text-muted-foreground">Valor após INSS menos todas as deduções</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <p className="font-medium">Tabela Progressiva</p>
                    <p className="text-sm text-muted-foreground">Aplicação das alíquotas por faixas de renda</p>
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

export default IRRFCalculator;