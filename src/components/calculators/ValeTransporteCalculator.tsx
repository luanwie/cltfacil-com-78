import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Calculator, RotateCcw, DollarSign, Bus, Building } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/currency";
import { useNavigate, useLocation } from "react-router-dom";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import { ensureCanCalculate } from "@/utils/usageGuard";
import { incrementCalcIfNeeded } from "@/utils/incrementCalc";

const ValeTransporteCalculator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();
  const { isPro, canUse } = ctx;

  const [salario, setSalario] = useState<number | undefined>();
  const [precoConducao, setPrecoConducao] = useState<number | undefined>();
  const [viagensPorDia, setViagensPorDia] = useState<number | undefined>(2);
  const [diasUteis, setDiasUteis] = useState<number | undefined>(22);

  const [resultado, setResultado] = useState<null | {
    salario: string;
    precoConducao: string;
    viagensValidadas: number;
    diasValidados: number;
    custoVT: string;
    descontoEmpregado: string;
    custoEmpresa: string;
    percentualDesconto: string;
    limiteDesconto: string;
  }>(null);

  const calcular = async () => {
    if (!salario || salario <= 0 || !precoConducao || precoConducao <= 0) return;

    const ok = await ensureCanCalculate({
      ...ctx,
      navigate,
      currentPath: location.pathname,
      focusUsage: () =>
        document.getElementById("usage-banner")?.scrollIntoView({ behavior: "smooth" }),
    });
    if (!ok) return;

    const viagensValidadas = Math.max(1, Math.round(viagensPorDia || 2));
    const diasValidados = Math.max(1, Math.round(diasUteis || 22));

    const custoVT = (precoConducao as number) * viagensValidadas * diasValidados;
    const descontoEmpregado = Math.min(0.06 * (salario as number), custoVT);
    const custoEmpresa = Math.max(0, custoVT - descontoEmpregado);

    await incrementCalcIfNeeded(isPro);

    setResultado({
      salario: formatBRL(salario as number),
      precoConducao: formatBRL(precoConducao as number),
      viagensValidadas,
      diasValidados,
      custoVT: formatBRL(custoVT),
      descontoEmpregado: formatBRL(descontoEmpregado),
      custoEmpresa: formatBRL(custoEmpresa),
      percentualDesconto: formatPercent(descontoEmpregado / (salario as number)),
      limiteDesconto: formatBRL((salario as number) * 0.06),
    });
  };

  const limpar = () => {
    setSalario(undefined);
    setPrecoConducao(undefined);
    setViagensPorDia(2);
    setDiasUteis(22);
    setResultado(null);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo de Vale-Transporte
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
              <Label htmlFor="preco-conducao">Preço da condução (R$)</Label>
              <NumberInput
                id="preco-conducao"
                value={precoConducao}
                onChange={setPrecoConducao}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="viagens-dia">Viagens por dia</Label>
              <NumberInput
                id="viagens-dia"
                value={viagensPorDia}
                onChange={setViagensPorDia}
                min={1}
                placeholder="2"
              />
              <p className="text-xs text-muted-foreground">Ida + volta = 2 viagens</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dias-uteis">Dias úteis no mês</Label>
              <NumberInput
                id="dias-uteis"
                value={diasUteis}
                onChange={setDiasUteis}
                min={1}
                max={31}
                placeholder="22"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={calcular}
              disabled={!salario || salario <= 0 || !precoConducao || precoConducao <= 0 || !canUse}
              className="flex-1"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {!canUse ? "Limite atingido" : "Calcular Vale-Transporte"}
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
                  <Bus className="w-4 h-4" />
                  Custo Total VT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resultado.custoVT}</div>
                <p className="text-sm text-muted-foreground">
                  {resultado.viagensValidadas} viagens × {resultado.diasValidados} dias
                </p>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Desconto Empregado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{resultado.descontoEmpregado}</div>
                <p className="text-sm text-muted-foreground">{resultado.percentualDesconto} (máx. 6%)</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Custo Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{resultado.custoEmpresa}</div>
                <p className="text-sm text-muted-foreground">Diferença do total</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Resumo da Divisão de Custos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Custo total mensal:</span>
                    <span className="font-medium">{resultado.custoVT}</span>
                  </div>
                  <div className="flex justify-between text-destructive">
                    <span className="text-sm">Desconto empregado:</span>
                    <span className="font-medium">-{resultado.descontoEmpregado}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-medium">
                    <span>Custo empresa:</span>
                    <span className="text-primary">{resultado.custoEmpresa}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-background border">
                    <div className="text-sm text-muted-foreground">Limite 6% do salário</div>
                    <div className="font-medium">{resultado.limiteDesconto}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <div className="text-sm text-muted-foreground">Desconto efetivo</div>
                    <div className="font-medium">{resultado.percentualDesconto}</div>
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
                    <p className="font-medium">Custo Total</p>
                    <p className="text-sm text-muted-foreground">
                      {resultado.precoConducao} × {resultado.viagensValidadas} viagens × {resultado.diasValidados} dias = {resultado.custoVT}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Desconto do Empregado</p>
                    <p className="text-sm text-muted-foreground">
                      Menor valor entre 6% do salário ({resultado.limiteDesconto}) e custo total ({resultado.custoVT})
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Custo da Empresa</p>
                    <p className="text-sm text-muted-foreground">
                      Custo total ({resultado.custoVT}) - desconto empregado ({resultado.descontoEmpregado}) = {resultado.custoEmpresa}
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

export default ValeTransporteCalculator;
