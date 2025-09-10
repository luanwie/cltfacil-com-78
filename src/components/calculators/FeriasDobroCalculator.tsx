import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Switch } from "@/components/ui/switch";
import Notice from "@/components/ui/notice";
import { Separator } from "@/components/ui/separator";
import { Calculator, DollarSign, RotateCcw, Settings2, Info } from "lucide-react";
import { formatBRL } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { PDFExportButton } from "@/components/ui/pdf-export-button";
import SaveCalcButton from "@/components/SaveCalcButton";

type Resultado = {
  baseRemuneracao: string;
  diasVencidos: number;
  periodosVencidos: number;
  valorSimplesPorPeriodo: string;
  valorDobroPorPeriodo: string;
  diferencaPorPeriodo: string;
  totalSimples: string;
  totalDobro: string;
  diferencaTotal: string;
  aplicouDobraNoTerco: boolean;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export default function FeriasDobroCalculator() {
  const { toast } = useToast();

  // Gate global (4 grátis; PRO ilimitado)
  const { isPro, remaining, allowOrRedirect, incrementCount } = useUsageLimit();
  const overLimit = !isPro && (remaining ?? 0) <= 0;

  // Entradas
  const [salario, setSalario] = useState<number | undefined>();
  const [mediaVariaveis, setMediaVariaveis] = useState<number | undefined>();
  const [diasVencidos, setDiasVencidos] = useState<number | undefined>(30); // 0..30
  const [periodosVencidos, setPeriodosVencidos] = useState<number | undefined>(1); // >=1
  const [dobraIncluiTerco, setDobraIncluiTerco] = useState<boolean>(true); // entendimento majoritário

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const countingRef = useRef(false); // evita contar 2x no mesmo clique

  function calcularInterno(): Resultado | null {
    const sal = Number(salario ?? 0);
    const varMed = Number(mediaVariaveis ?? 0);
    if (sal <= 0) return null;

    const dias = clamp(Number(diasVencidos ?? 0), 0, 30);
    const periodos = Math.max(1, Math.trunc(Number(periodosVencidos ?? 1)));

    const baseRem = sal + varMed;
    const valorDia = baseRem / 30;

    // férias simples (um período): (base/30 * dias) + 1/3
    const principal = valorDia * dias;
    const terco = principal / 3;
    const simplesPorPeriodo = principal + terco;

    // férias em dobro (um período):
    // - se dobra também o 1/3: 2 * (principal + terco)
    // - se não: (2 * principal) + terco
    const dobroPorPeriodo = dobraIncluiTerco ? 2 * simplesPorPeriodo : (2 * principal) + terco;

    const totalSimples = simplesPorPeriodo * periodos;
    const totalDobro = dobroPorPeriodo * periodos;

    return {
      baseRemuneracao: formatBRL(baseRem),
      diasVencidos: dias,
      periodosVencidos: periodos,
      valorSimplesPorPeriodo: formatBRL(simplesPorPeriodo),
      valorDobroPorPeriodo: formatBRL(dobroPorPeriodo),
      diferencaPorPeriodo: formatBRL(dobroPorPeriodo - simplesPorPeriodo),
      totalSimples: formatBRL(totalSimples),
      totalDobro: formatBRL(totalDobro),
      diferencaTotal: formatBRL(totalDobro - totalSimples),
      aplicouDobraNoTerco: dobraIncluiTerco,
    };
  }

  async function handleCalcular() {
    const ok = await allowOrRedirect();
    if (!ok) return;

    const res = calcularInterno();
    if (!res) {
      toast({
        title: "Preencha os campos corretamente",
        description: "Informe um salário válido e ajuste dias/períodos vencidos.",
      });
      return;
    }

    setResultado(res);

    if (!countingRef.current) {
      countingRef.current = true;
      try {
        await incrementCount();
      } finally {
        setTimeout(() => (countingRef.current = false), 200);
      }
    }
  }

  function limpar() {
    setSalario(undefined);
    setMediaVariaveis(undefined);
    setDiasVencidos(30);
    setPeriodosVencidos(1);
    setDobraIncluiTerco(true);
    setResultado(null);
  }

  const canCalc = !!salario && (salario as number) > 0 && !overLimit;

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Calculadora de Férias em Dobro
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Notice variant="info">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5" />
              <p>
                A “<strong>dobla</strong>” aplica-se quando as férias não são concedidas no período concessivo
                (art. 137 da CLT). A remuneração das férias considera <strong>salário + médias variáveis</strong>.
              </p>
            </div>
          </Notice>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Salário mensal (R$)</Label>
              <NumberInput
                value={salario}
                onChange={setSalario}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label>Média de variáveis (R$, opcional)</Label>
              <NumberInput
                value={mediaVariaveis}
                onChange={setMediaVariaveis}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
              <p className="text-xs text-muted-foreground">
                Ex.: comissões, HE e adicionais habituais.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Dias vencidos por período (0–30)</Label>
              <NumberInput
                value={diasVencidos}
                onChange={(v) => setDiasVencidos(clamp(v ?? 0, 0, 30))}
                min={0}
                max={30}
                placeholder="30"
              />
            </div>

            <div className="space-y-2">
              <Label>Quantidade de períodos vencidos</Label>
              <NumberInput
                value={periodosVencidos}
                onChange={(v) => setPeriodosVencidos(Math.max(1, Math.trunc(v ?? 1)))}
                min={1}
                max={5}
                placeholder="1"
              />
              <p className="text-xs text-muted-foreground">
                Use &gt; 1 se houver mais de um período não concedido no prazo.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Opções avançadas
            </Label>
            <div className="flex items-center gap-3">
              <Switch id="dobra-terco" checked={dobraIncluiTerco} onCheckedChange={setDobraIncluiTerco} />
              <Label htmlFor="dobra-terco" className="text-sm">
                Dobrar também o <strong>1/3</strong> constitucional (padrão)
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Se desativar, a dobra incidirá apenas sobre o valor principal das férias; o 1/3 fica simples.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCalcular} disabled={!canCalc} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              {overLimit ? "Limite atingido" : "Calcular"}
            </Button>

            <Button variant="outline" onClick={limpar}>
              <RotateCcw className="w-4 h-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {resultado && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Resultado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-3 border rounded bg-background">
                <div className="text-sm text-muted-foreground">Base de remuneração</div>
                <div className="text-lg font-semibold">{resultado.baseRemuneracao}</div>
              </div>
              <div className="p-3 border rounded bg-background">
                <div className="text-sm text-muted-foreground">Dias / Períodos</div>
                <div className="text-lg font-semibold">
                  {resultado.diasVencidos} dias × {resultado.periodosVencidos} período(s)
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="p-3 border rounded bg-background">
                <div className="text-sm text-muted-foreground">Por período (simples)</div>
                <div className="text-lg font-semibold">{resultado.valorSimplesPorPeriodo}</div>
              </div>
              <div className="p-3 border rounded bg-background">
                <div className="text-sm text-muted-foreground">Por período (em dobro)</div>
                <div className="text-lg font-semibold text-primary">{resultado.valorDobroPorPeriodo}</div>
              </div>
              <div className="p-3 border rounded bg-background">
                <div className="text-sm text-muted-foreground">Diferença por período</div>
                <div className="text-lg font-semibold">{resultado.diferencaPorPeriodo}</div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total (simples):</span>
                <span>{resultado.totalSimples}</span>
              </div>
              <div className="flex justify-between font-semibold text-primary">
                <span>Total (em dobro):</span>
                <span>{resultado.totalDobro}</span>
              </div>
              <div className="flex justify-between">
                <span>Diferença a mais:</span>
                <span>{resultado.diferencaTotal}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {resultado.aplicouDobraNoTerco
                  ? "Aplicado: dobra também sobre o 1/3."
                  : "Aplicado: dobra apenas sobre o principal; 1/3 simples."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão Exportar PDF */}
      {resultado && (
        <div className="flex justify-center">
          <PDFExportButton
            calculatorName="Calculadora de Férias em Dobro"
            results={[
              { label: "Base de Remuneração", value: resultado.baseRemuneracao },
              { label: "Dias Vencidos", value: `${resultado.diasVencidos} dias` },
              { label: "Períodos Vencidos", value: `${resultado.periodosVencidos} período(s)` },
              { label: "Valor por Período (Simples)", value: resultado.valorSimplesPorPeriodo },
              { label: "Valor por Período (Dobro)", value: resultado.valorDobroPorPeriodo },
              { label: "Diferença por Período", value: resultado.diferencaPorPeriodo },
              { label: "Total Simples", value: resultado.totalSimples },
              { label: "Total em Dobro", value: resultado.totalDobro },
              { label: "Diferença Total", value: resultado.diferencaTotal },
            ]}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Como calculamos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
            <div>
              <p className="font-medium">Base e proporcionalidade</p>
              <p className="text-sm text-muted-foreground">
                Base = salário + médias variáveis. Valor do dia = Base ÷ 30. Consideramos os dias informados (0–30) por período.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
            <div>
              <p className="font-medium">Férias simples</p>
              <p className="text-sm text-muted-foreground">
                Simples = (Base ÷ 30 × dias) + 1/3.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
            <div>
              <p className="font-medium">Férias em dobro</p>
              <p className="text-sm text-muted-foreground">
                {`Se "dobrar 1/3" ativado: 2 × (Simples). Caso contrário: (2 × principal) + 1/3.`}
              </p>
            </div>
          </div>

          <Notice>
            <strong>Notas legais:</strong> a dobra do art. 137/CLT vale quando as férias não são
            concedidas no período concessivo (12 meses após o período aquisitivo). O STF declarou
            <em> inconstitucional</em> a Súmula 450/TST (dobra por mero atraso no pagamento com férias gozadas no prazo),
            então atraso no pagamento <em>não</em> gera dobra automática. Convenções/accordos podem prever particularidades.
          </Notice>
        </CardContent>
      </Card>
    </div>
  );
}
