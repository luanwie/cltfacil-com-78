import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Calculator, RotateCcw, DollarSign, Percent } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/currency";
import { calcularINSSSync, calcularIRRFSync } from "@/lib/tabelas";
import { useNavigate, useLocation } from "react-router-dom";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import UsageBanner from "@/components/UsageBanner";
import { goPro } from "@/utils/proRedirect";
import { ensureCanCalculate } from "@/utils/usageGuard";
import { incrementCalcIfNeeded } from "@/utils/incrementCalc";

const SalarioLiquidoCalculator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();
  const { isPro, isLogged, remaining, canUse } = ctx;

  const [salarioBruto, setSalarioBruto] = useState<number | undefined>();
  const [dependentes, setDependentes] = useState<number | undefined>(0);
  const [pensaoAlimenticia, setPensaoAlimenticia] = useState<number | undefined>(0);
  const [custoValeTransporte, setCustoValeTransporte] = useState<number | undefined>(0);

  const [resultado, setResultado] = useState<any>(null);

  const calcular = async () => {
    if (!salarioBruto || salarioBruto <= 0) return;

    const ok = await ensureCanCalculate({ 
      ...ctx, 
      navigate, 
      currentPath: location.pathname, 
      focusUsage: () => document.getElementById('usage-banner')?.scrollIntoView({behavior:'smooth'}) 
    });
    if (!ok) return;

    const dependentesValidados = Math.max(0, dependentes || 0);
    const pensaoValidada = Math.max(0, pensaoAlimenticia || 0);
    const custoVT = Math.max(0, custoValeTransporte || 0);

    // Cálculo INSS
    const inss = calcularINSSSync(salarioBruto);
    
    // Base para IRRF = salário bruto - INSS
    const baseIRRF = salarioBruto - inss.valor;
    
    // Cálculo IRRF
    const irrf = calcularIRRFSync(baseIRRF, dependentesValidados, pensaoValidada);
    
    // Vale-transporte (máximo 6% do salário)
    const maxDescontoVT = salarioBruto * 0.06;
    const descontoVT = Math.min(maxDescontoVT, custoVT);
    
    // Salário líquido
    const totalDescontos = inss.valor + irrf.valor + descontoVT;
    const salarioLiquido = salarioBruto - totalDescontos;

    // Increment usage count for non-PRO users
    await incrementCalcIfNeeded(isPro);

    const result = {
      salarioBruto: formatBRL(salarioBruto),
      inssValor: formatBRL(inss.valor),
      inssAliquota: formatPercent(inss.aliquotaEfetiva),
      irrfValor: formatBRL(irrf.valor),
      irrfAliquota: formatPercent(irrf.aliquotaEfetiva),
      descontoVT: formatBRL(descontoVT),
      totalDescontos: formatBRL(totalDescontos),
      salarioLiquido: formatBRL(salarioLiquido),
      percentualLiquido: formatPercent(salarioLiquido / salarioBruto)
    };

    setResultado(result);
  };

  const limpar = () => {
    setSalarioBruto(undefined);
    setDependentes(0);
    setPensaoAlimenticia(0);
    setCustoValeTransporte(0);
    setResultado(null);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Dados para Cálculo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            </div>
          </div>

          <UsageBanner 
            remaining={remaining} 
            isPro={isPro} 
            isLogged={isLogged} 
            onGoPro={() => goPro(navigate, isLogged, location.pathname)} 
          />

          <div className="flex gap-2">
            <Button
              onClick={calcular}
              disabled={!salarioBruto || salarioBruto <= 0 || !canUse}
              className="flex-1"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {!canUse ? 'Limite atingido' : 'Calcular Salário Líquido'}
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
                  INSS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-destructive">
                  {resultado.inssValor}
                </div>
                <p className="text-sm text-muted-foreground">
                  Alíquota efetiva: {resultado.inssAliquota}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  IRRF
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-destructive">
                  {resultado.irrfValor}
                </div>
                <p className="text-sm text-muted-foreground">
                  Alíquota efetiva: {resultado.irrfAliquota}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Vale-Transporte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-destructive">
                  {resultado.descontoVT}
                </div>
                <p className="text-sm text-muted-foreground">
                  Máximo 6% do salário
                </p>
              </CardContent>
            </Card>
          </div>

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
                  <div className="text-3xl font-bold text-primary mb-2">
                    {resultado.salarioLiquido}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {resultado.percentualLiquido} do salário bruto
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Salário bruto:</span>
                    <span className="font-medium">{resultado.salarioBruto}</span>
                  </div>
                  <div className="flex justify-between text-sm text-destructive">
                    <span>Total descontos:</span>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Como Calculamos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
                  <div>
                    <p className="font-medium">INSS (Previdência Social)</p>
                    <p className="text-sm text-muted-foreground">Cálculo progressivo por faixas de contribuição</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <p className="font-medium">IRRF (Imposto de Renda)</p>
                    <p className="text-sm text-muted-foreground">Calculado sobre (Salário - INSS - Dependentes - Pensão)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <p className="font-medium">Vale-Transporte</p>
                    <p className="text-sm text-muted-foreground">Desconto limitado a 6% do salário bruto</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">4</div>
                  <div>
                    <p className="font-medium">Salário Líquido</p>
                    <p className="text-sm text-muted-foreground">Salário bruto menos todos os descontos obrigatórios</p>
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

export default SalarioLiquidoCalculator;