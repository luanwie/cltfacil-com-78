import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Switch } from "@/components/ui/switch";
import { Calculator, RotateCcw, DollarSign, AlertTriangle } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/currency";

import { useNavigate, useLocation } from "react-router-dom";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import UsageBanner from "@/components/UsageBanner";
import { navigateToProPage } from "@/utils/proRedirect";
import { ensureCanCalculate } from "@/utils/usageGuard";
import { incrementCalcIfNeeded } from "@/utils/incrementCalc";

type Resultado = {
  salarioBase: string;
  adicional: string;
  percentualAdicional: string;
  salarioTotal: string;
  aumentoPercentual: string;
  elegivel: boolean;
};

const PericulosidadeCalculator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();
  const { isPro, isLogged, remaining, canUse } = ctx;

  const [salario, setSalario] = useState<number | undefined>();
  const [elegivel, setElegivel] = useState<boolean>(true);
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

    const adicional = elegivel ? salario * 0.3 : 0;
    const salarioTotal = salario + adicional;

    await incrementCalcIfNeeded(isPro);

    setResultado({
      salarioBase: formatBRL(salario),
      adicional: formatBRL(adicional),
      percentualAdicional: formatPercent(0.3),
      salarioTotal: formatBRL(salarioTotal),
      aumentoPercentual: elegivel ? formatPercent(0.3) : formatPercent(0),
      elegivel,
    });
  };

  const limpar = () => {
    setSalario(undefined);
    setElegivel(true);
    setResultado(null);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo de Periculosidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salario">Salário base mensal (R$)</Label>
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
              <Label htmlFor="elegivel">Elegível para periculosidade?</Label>
              <div className="flex items-center space-x-2">
                <Switch id="elegivel" checked={elegivel} onCheckedChange={setElegivel} />
                <Label htmlFor="elegivel" className="text-sm">
                  {elegivel ? "Sim, trabalha em atividade perigosa" : "Não elegível"}
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Conforme NR-16 (explosivos, inflamáveis, energia elétrica, etc.)
              </p>
            </div>
          </div>

          {/* Banner padronizado: contador global / CTA PRO */}
          <div id="usage-banner">
            <UsageBanner
              remaining={remaining}
              isPro={isPro}
              isLogged={isLogged}
              onGoPro={() => navigateToProPage(navigate, isLogged, location.pathname)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={calcular} disabled={!salario || salario <= 0 || !canUse} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              {!canUse ? "Limite atingido" : "Calcular Periculosidade"}
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
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Salário Base
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resultado.salarioBase}</div>
                <p className="text-sm text-muted-foreground">Valor contratual</p>
              </CardContent>
            </Card>

            <Card className={resultado.elegivel ? "border-primary/20 bg-primary/5" : "border-muted"}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Adicional de Periculosidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    resultado.elegivel ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {resultado.adicional}
                </div>
                <p className="text-sm text-muted-foreground">
                  {resultado.elegivel ? "30% do salário base" : "Não aplicável"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Salário Total com Adicional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">{resultado.salarioTotal}</div>
                  <p className="text-sm text-muted-foreground">
                    {resultado.elegivel ? `Aumento de ${resultado.aumentoPercentual}` : "Sem adicional"}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Salário base:</span>
                    <span className="font-medium">{resultado.salarioBase}</span>
                  </div>
                  {resultado.elegivel && (
                    <div className="flex justify-between text-primary">
                      <span className="text-sm">Periculosidade:</span>
                      <span className="font-medium">+{resultado.adicional}</span>
                    </div>
                  )}
                  <hr />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span className="text-primary">{resultado.salarioTotal}</span>
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
                    <p className="font-medium">Verificação de Elegibilidade</p>
                    <p className="text-sm text-muted-foreground">Trabalho em atividade perigosa conforme NR-16</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Cálculo do Adicional</p>
                    <p className="text-sm text-muted-foreground">
                      {resultado.elegivel
                        ? `30% × ${resultado.salarioBase} = ${resultado.adicional}`
                        : "Não aplicável para esta atividade"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Integração Salarial</p>
                    <p className="text-sm text-muted-foreground">
                      Adicional integra o salário para todos os demais cálculos trabalhistas
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

export default PericulosidadeCalculator;
