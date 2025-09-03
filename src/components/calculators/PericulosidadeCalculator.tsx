import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Switch } from "@/components/ui/switch";
import { Calculator, RotateCcw, DollarSign, AlertTriangle, Percent, Factory } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/currency";
import { useNavigate, useLocation } from "react-router-dom";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import UsageBanner from "@/components/UsageBanner";
import { goPro } from "@/utils/proRedirect";
import { ensureCanCalculate } from "@/utils/usageGuard";
import { incrementCalcIfNeeded } from "@/utils/incrementCalc";

type Resultado = {
  salarioBase: string;
  adicionaisFixos: string;
  baseConsiderada: string;
  percentualAplicado: string;
  exposicaoAplicada: string;
  adicionalMensal: string;
  salarioTotal: string;
  aumentoPercentual: string;
  elegivel: boolean;

  // Reflexos (estimativas mensais/anualizadas)
  reflexos?: {
    feriasMaisTerco: string; // 1 mês de férias + 1/3 sobre o adicional
    decimoTerceiro: string;  // 1 mês de adicional
    fgtsSobreAdicional: string; // 8% do adicional mensal
  };
};

const PericulosidadeCalculator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();
  const { isPro, isLogged, remaining, canUse } = ctx;

  // Entradas
  const [salario, setSalario] = useState<number | undefined>();
  const [adicionaisFixos, setAdicionaisFixos] = useState<number | undefined>(0);
  const [percentual, setPercentual] = useState<number | undefined>(30); // padrão NR-16
  const [exposicao, setExposicao] = useState<number | undefined>(100);  // % de exposição, padrão 100
  const [elegivel, setElegivel] = useState<boolean>(true);
  const [calcularReflexos, setCalcularReflexos] = useState<boolean>(true);

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

    const baseConsideradaNum = (salario || 0) + Math.max(0, adicionaisFixos || 0);
    const perc = Math.max(0, percentual || 0) / 100;
    const expo = Math.max(0, Math.min(100, exposicao || 0)) / 100;

    const adicionalMensalNum = elegivel ? baseConsideradaNum * perc * expo : 0;
    const salarioTotalNum = (salario || 0) + adicionalMensalNum;

    const res: Resultado = {
      salarioBase: formatBRL(salario || 0),
      adicionaisFixos: formatBRL(Math.max(0, adicionaisFixos || 0)),
      baseConsiderada: formatBRL(baseConsideradaNum),
      percentualAplicado: formatPercent(perc),
      exposicaoAplicada: formatPercent(expo),
      adicionalMensal: formatBRL(adicionalMensalNum),
      salarioTotal: formatBRL(salarioTotalNum),
      aumentoPercentual: formatPercent(adicionalMensalNum / Math.max(1, salario || 1)),
      elegivel,
    };

    if (calcularReflexos && elegivel) {
      const feriasMaisTercoNum = adicionalMensalNum * (1 + 1 / 3); // férias integrais + 1/3 sobre o adicional
      const decimoTerceiroNum = adicionalMensalNum;                // adicional habitual integra 13º (estimativa)
      const fgtsSobreAdicionalNum = adicionalMensalNum * 0.08;     // FGTS incide sobre remuneração
      res.reflexos = {
        feriasMaisTerco: formatBRL(feriasMaisTercoNum),
        decimoTerceiro: formatBRL(decimoTerceiroNum),
        fgtsSobreAdicional: formatBRL(fgtsSobreAdicionalNum),
      };
    }

    await incrementCalcIfNeeded(isPro);
    setResultado(res);
  };

  const limpar = () => {
    setSalario(undefined);
    setAdicionaisFixos(0);
    setPercentual(30);
    setExposicao(100);
    setElegivel(true);
    setCalcularReflexos(true);
    setResultado(null);
  };

  const canSubmit = !!salario && salario > 0 && canUse;

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo de Periculosidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salario">Salário base contratual (R$)</Label>
              <NumberInput
                id="salario"
                value={salario}
                onChange={setSalario}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
              <p className="text-xs text-muted-foreground">Base típica: salário do cargo efetivo.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adicionaisFixos">Adicionais/Gratificações fixas (R$)</Label>
              <NumberInput
                id="adicionaisFixos"
                value={adicionaisFixos}
                onChange={setAdicionaisFixos}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
              <p className="text-xs text-muted-foreground">
                Opcional — algumas empresas/ccts somam verbas fixas à base.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentual">Percentual do adicional (%)</Label>
              <NumberInput
                id="percentual"
                value={percentual}
                onChange={setPercentual}
                suffix="%"
                min={0}
                max={100}
                placeholder="30"
              />
              <p className="text-xs text-muted-foreground">Padrão legal: 30% (NR-16).</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exposicao">% de exposição no período</Label>
              <NumberInput
                id="exposicao"
                value={exposicao}
                onChange={setExposicao}
                suffix="%"
                min={0}
                max={100}
                placeholder="100"
              />
              <p className="text-xs text-muted-foreground">
                Use 100% por padrão. Ajuste se a CCT prever proporcionalidade.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="elegivel">Elegível para periculosidade?</Label>
              <div className="flex items-center space-x-2">
                <Switch id="elegivel" checked={elegivel} onCheckedChange={setElegivel} />
                <Label htmlFor="elegivel" className="text-sm">
                  {elegivel ? "Sim, atividade perigosa (NR-16)" : "Não elegível"}
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Exemplos: inflamáveis, explosivos, eletricidade, segurança patrimonial etc.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reflexos">Calcular reflexos (férias+1/3, 13º, FGTS)?</Label>
              <div className="flex items-center space-x-2">
                <Switch id="reflexos" checked={calcularReflexos} onCheckedChange={setCalcularReflexos} />
                <Label htmlFor="reflexos" className="text-sm">
                  {calcularReflexos ? "Sim, considerar reflexos" : "Não considerar"}
                </Label>
              </div>
            </div>
          </div>

          {/* Banner padronizado: contador global / CTA PRO */}
          <div id="usage-banner">
            <UsageBanner
              remaining={remaining}
              isPro={isPro}
              isLogged={isLogged}
              onGoPro={() => goPro(navigate, isLogged, location.pathname)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={calcular} disabled={!canSubmit} className="flex-1">
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
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Base Considerada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{resultado.baseConsiderada}</div>
                <p className="text-xs text-muted-foreground">
                  Salário ({resultado.salarioBase}) + fixos ({resultado.adicionaisFixos})
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Parâmetros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Percentual:</span>
                    <span className="font-medium">{resultado.percentualAplicado}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Exposição:</span>
                    <span className="font-medium">{resultado.exposicaoAplicada}</span>
                  </div>
                </div>
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
                  {resultado.adicionalMensal}
                </div>
                <p className="text-sm text-muted-foreground">
                  {resultado.elegivel ? "Incide sobre a base considerada" : "Não aplicável"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Salário Total (mês)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {resultado.salarioTotal}
                  </div>
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
                      <span className="font-medium">+{resultado.adicionalMensal}</span>
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

          {resultado.reflexos && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Factory className="w-5 h-5" />
                  Reflexos (estimativas sobre adicional habitual)
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="p-3 rounded-lg bg-background border">
                  <div className="text-xs text-muted-foreground mb-1">Férias + 1/3</div>
                  <div className="text-lg font-semibold">{resultado.reflexos.feriasMaisTerco}</div>
                </div>
                <div className="p-3 rounded-lg bg-background border">
                  <div className="text-xs text-muted-foreground mb-1">13º salário</div>
                  <div className="text-lg font-semibold">{resultado.reflexos.decimoTerceiro}</div>
                </div>
                <div className="p-3 rounded-lg bg-background border">
                  <div className="text-xs text-muted-foreground mb-1">FGTS (8%) ao mês</div>
                  <div className="text-lg font-semibold">{resultado.reflexos.fgtsSobreAdicional}</div>
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
                    <p className="font-medium">Base Considerada</p>
                    <p className="text-sm text-muted-foreground">
                      Salário base + adicionais fixos (se houver) = {resultado.baseConsiderada}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <p className="font-medium">Aplicação do Percentual/Exposição</p>
                    <p className="text-sm text-muted-foreground">
                      {resultado.percentualAplicado} × {resultado.exposicaoAplicada} × base = {resultado.adicionalMensal}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <p className="font-medium">Integração e Reflexos</p>
                    <p className="text-sm text-muted-foreground">
                      Adicional integra a remuneração e reflete em férias+1/3, 13º e FGTS (quando habitual).
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
