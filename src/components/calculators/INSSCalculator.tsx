import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Calculator, RotateCcw, DollarSign, Percent } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/currency";
import { calcularINSSSync } from "@/lib/tabelas";

import { useNavigate, useLocation } from "react-router-dom";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import UsageBanner from "@/components/UsageBanner";
import { navigateToProPage } from "@/utils/proRedirect";
import { ensureCanCalculate } from "@/utils/usageGuard";
import { incrementCalcIfNeeded } from "@/utils/incrementCalc";

type Resultado = {
  salario: string;
  valorINSS: string;
  aliquotaEfetiva: string;
  faixaMarginal: string;
  salarioLiquido: string;
};

const INSSCalculator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();
  const { isPro, isLogged, remaining, canUse } = ctx;

  const [salario, setSalario] = useState<number | undefined>();
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const calcular = async () => {
    if (!salario || salario <= 0) return;

    const ok = await ensureCanCalculate({
      ...ctx,
      navigate,
      currentPath: location.pathname,
      focusUsage: () =>
        document.getElementById("usage-banner")?.scrollIntoView({ behavior: "smooth" }),
    });
    if (!ok) return;

    const r = calcularINSSSync(salario);

    setResultado({
      salario: formatBRL(salario),
      valorINSS: formatBRL(r.valor),
      aliquotaEfetiva: formatPercent(r.aliquotaEfetiva),
      faixaMarginal: formatPercent(r.faixaMarginal),
      salarioLiquido: formatBRL(salario - r.valor),
    });

    await incrementCalcIfNeeded(isPro);
  };

  const limpar = () => {
    setSalario(undefined);
    setResultado(null);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo do INSS
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
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

          {/* Banner padronizado */}
          <div id="usage-banner">
            <UsageBanner
              remaining={remaining}
              isPro={isPro}
              isLogged={isLogged}
              onGoPro={() => navigateToProPage(navigate, isLogged, location.pathname)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={calcular}
              disabled={!salario || salario <= 0 || !canUse}
              className="flex-1"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {!canUse ? "Limite atingido" : "Calcular INSS"}
            </Button>
            <Button variant="outline" onClick={limpar}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {resultado && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Contribuição INSS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {resultado.valorINSS}
                </div>
                <p className="text-sm text-muted-foreground">Desconto mensal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Alíquotas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Efetiva:</span>
                    <span className="font-medium">{resultado.aliquotaEfetiva}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Marginal:</span>
                    <span className="font-medium">{resultado.faixaMarginal}</span>
                  </div>
                </div>
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Salário bruto:</span>
                    <span className="font-medium">{resultado.salario}</span>
                  </div>
                  <div className="flex justify-between text-destructive">
                    <span className="text-sm">INSS:</span>
                    <span className="font-medium">-{resultado.valorINSS}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-medium">
                    <span>Após INSS:</span>
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
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Faixas Progressivas</p>
                    <p className="text-sm text-muted-foreground">
                      INSS é calculado por faixas com alíquotas diferentes
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Teto da Contribuição</p>
                    <p className="text-sm text-muted-foreground">
                      Salários acima de R$ 7.786,02 não têm desconto adicional
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Alíquota Efetiva</p>
                    <p className="text-sm text-muted-foreground">
                      Percentual real do desconto sobre o salário total
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
