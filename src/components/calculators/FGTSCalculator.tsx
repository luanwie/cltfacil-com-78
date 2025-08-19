import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, RotateCcw, DollarSign, TrendingUp } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/currency";
import { useNavigate, useLocation } from "react-router-dom";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import UsageBanner from "@/components/UsageBanner";
import { goPro } from "@/utils/proRedirect";
import { ensureCanCalculate } from "@/utils/usageGuard";
import { incrementCalcIfNeeded } from "@/utils/incrementCalc";

const FGTSCalculator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();
  const { isPro, isLogged, remaining, canUse } = ctx;

  const [salario, setSalario] = useState<number | undefined>();
  const [meses, setMeses] = useState<number | undefined>(12);
  const [saldoAtual, setSaldoAtual] = useState<number | undefined>(0);
  const [tipoMulta, setTipoMulta] = useState<string>("40");

  const [resultado, setResultado] = useState<any>(null);

  const calcular = async () => {
    if (!salario || salario <= 0) return;

    const ok = await ensureCanCalculate({ 
      ...ctx, 
      navigate, 
      currentPath: location.pathname, 
      focusUsage: () => document.getElementById('usage-banner')?.scrollIntoView({behavior:'smooth'}) 
    });
    if (!ok) return;

    const mesesValidados = Math.max(1, Math.min(12, meses || 12));
    const saldoValidado = Math.max(0, saldoAtual || 0);
    const depositoMensal = salario * 0.08;
    const totalPeriodo = depositoMensal * mesesValidados;
    
    let multa = 0;
    if (saldoValidado > 0) {
      const aliquotaMulta = tipoMulta === "40" ? 0.40 : tipoMulta === "20" ? 0.20 : 0;
      multa = saldoValidado * aliquotaMulta;
    }
    
    // Increment usage count for non-PRO users
    await incrementCalcIfNeeded(isPro);
    
    const result = {
      salario: formatBRL(salario),
      depositoMensal: formatBRL(depositoMensal),
      mesesValidados,
      totalPeriodo: formatBRL(totalPeriodo),
      saldoAtual: formatBRL(saldoValidado),
      aliquotaMulta: formatPercent(parseFloat(tipoMulta) / 100),
      multa: formatBRL(multa),
      totalComMulta: formatBRL(saldoValidado + multa)
    };

    setResultado(result);
  };

  const limpar = () => {
    setSalario(undefined);
    setMeses(12);
    setSaldoAtual(0);
    setTipoMulta("40");
    setResultado(null);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Simulação FGTS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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

            <div className="space-y-2">
              <Label htmlFor="meses">Meses para projeção</Label>
              <NumberInput
                id="meses"
                value={meses}
                onChange={setMeses}
                min={1}
                max={12}
                placeholder="12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="saldo-atual">Saldo atual FGTS (R$)</Label>
              <NumberInput
                id="saldo-atual"
                value={saldoAtual}
                onChange={setSaldoAtual}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo-multa">Tipo de multa rescisória</Label>
              <Select value={tipoMulta} onValueChange={setTipoMulta}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="40">40% - Demissão sem justa causa</SelectItem>
                  <SelectItem value="20">20% - Acordo (Art. 484-A)</SelectItem>
                  <SelectItem value="0">0% - Outras situações</SelectItem>
                </SelectContent>
              </Select>
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
              disabled={!salario || salario <= 0 || !canUse}
              className="flex-1"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {!canUse ? 'Limite atingido' : 'Calcular FGTS'}
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
                  Depósito Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {resultado.depositoMensal}
                </div>
                <p className="text-sm text-muted-foreground">
                  8% do salário bruto
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Total no Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {resultado.totalPeriodo}
                </div>
                <p className="text-sm text-muted-foreground">
                  {resultado.mesesValidados} meses
                </p>
              </CardContent>
            </Card>
          </div>

          {parseFloat(resultado.saldoAtual.replace(/[^\d,]/g, '').replace(',', '.')) > 0 && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-destructive" />
                  Simulação de Multa Rescisória
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Saldo atual</div>
                    <div className="text-xl font-semibold">{resultado.saldoAtual}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Multa ({resultado.aliquotaMulta})</div>
                    <div className="text-xl font-semibold text-destructive">{resultado.multa}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total a receber</div>
                    <div className="text-xl font-bold text-primary">{resultado.totalComMulta}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Como Calculamos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
                  <div>
                    <p className="font-medium">Depósito Mensal</p>
                    <p className="text-sm text-muted-foreground">8% do salário bruto depositado mensalmente pelo empregador</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <p className="font-medium">Projeção no Período</p>
                    <p className="text-sm text-muted-foreground">Depósito mensal × número de meses (sem rendimentos)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <p className="font-medium">Multa Rescisória</p>
                    <p className="text-sm text-muted-foreground">40% (demissão) ou 20% (acordo) sobre o saldo total do FGTS</p>
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

export default FGTSCalculator;