import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, RotateCcw, DollarSign, AlertTriangle } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/currency";

import { useNavigate, useLocation } from "react-router-dom";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import { ensureCanCalculate } from "@/utils/usageGuard";
import { incrementCalcIfNeeded } from "@/utils/incrementCalc";

const InsalubridadeCalculator = () => {
  // ---- USO/PRO (controle global) ----
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();
  const { isPro, canUse } = ctx;

  // ---- Form state ----
  const [salario, setSalario] = useState<number | undefined>();
  const [grau, setGrau] = useState<string>("20");
  const [baseCalculo, setBaseCalculo] = useState<string>("minimo");
  const [salarioMinimo] = useState<number>(1412.0); // 2025

  // ---- Resultado ----
  const [resultado, setResultado] = useState<{
    salarioBase: string;
    grauPercentual: string;
    baseUsada: string;
    baseCalculoTipo: string;
    adicional: string;
    salarioTotal: string;
    aumentoPercentual: string;
  } | null>(null);

  const calcular = async () => {
    if (!salario || salario <= 0) return;

    // Gate de uso: bloqueia quando zerou e CTA PRO
    const ok = await ensureCanCalculate({
      ...ctx,
      navigate,
      currentPath: location.pathname,
      focusUsage: () =>
        document.getElementById("usage-banner")?.scrollIntoView({ behavior: "smooth" }),
    });
    if (!ok) return;

    const grauPercentualNum = parseInt(grau) / 100;
    const baseUsadaNum = baseCalculo === "minimo" ? salarioMinimo : salario;
    const adicionalNum = baseUsadaNum * grauPercentualNum;
    const salarioTotalNum = salario + adicionalNum;

    // Desconta 1 uso global (se não for PRO)
    await incrementCalcIfNeeded(isPro);

    setResultado({
      salarioBase: formatBRL(salario),
      grauPercentual: formatPercent(grauPercentualNum),
      baseUsada: formatBRL(baseUsadaNum),
      baseCalculoTipo: baseCalculo === "minimo" ? "Salário Mínimo" : "Salário Contratual",
      adicional: formatBRL(adicionalNum),
      salarioTotal: formatBRL(salarioTotalNum),
      aumentoPercentual: formatPercent(adicionalNum / salario),
    });
  };

  const limpar = () => {
    setSalario(undefined);
    setGrau("20");
    setBaseCalculo("minimo");
    setResultado(null);
  };

  const canSubmit = !!salario && salario > 0 && canUse;

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo de Insalubridade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salario">Salário contratual (R$)</Label>
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
              <Label htmlFor="grau">Grau de insalubridade</Label>
              <Select value={grau} onValueChange={setGrau}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Grau mínimo (10%)</SelectItem>
                  <SelectItem value="20">Grau médio (20%)</SelectItem>
                  <SelectItem value="40">Grau máximo (40%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="base-calculo">Base de cálculo</Label>
              <Select value={baseCalculo} onValueChange={setBaseCalculo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimo">Salário Mínimo (R$ 1.412,00)</SelectItem>
                  <SelectItem value="contratual">Salário Contratual</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Verifique sua convenção coletiva para definir a base correta
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={calcular} disabled={!canSubmit} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              {!canUse ? "Limite atingido" : "Calcular Insalubridade"}
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
                  Base de Cálculo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{resultado.baseUsada}</div>
                <p className="text-sm text-muted-foreground">{resultado.baseCalculoTipo}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Grau Aplicado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-orange-600">{resultado.grauPercentual}</div>
                <p className="text-sm text-muted-foreground">Conforme NR-15</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Adicional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-primary">{resultado.adicional}</div>
                <p className="text-sm text-muted-foreground">
                  {resultado.grauPercentual} da base
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
                  <div className="text-3xl font-bold text-primary mb-2">
                    {resultado.salarioTotal}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Aumento de {resultado.aumentoPercentual}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Salário base:</span>
                    <span className="font-medium">{resultado.salarioBase}</span>
                  </div>
                  <div className="flex justify-between text-primary">
                    <span className="text-sm">Insalubridade:</span>
                    <span className="font-medium">+{resultado.adicional}</span>
                  </div>
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
                    <p className="font-medium">Definição da Base</p>
                    <p className="text-sm text-muted-foreground">
                      {resultado.baseCalculoTipo}: {resultado.baseUsada}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Aplicação do Grau</p>
                    <p className="text-sm text-muted-foreground">
                      {resultado.grauPercentual} × {resultado.baseUsada} = {resultado.adicional}
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
                      Adicional integra o salário para demais cálculos trabalhistas
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

export default InsalubridadeCalculator;
