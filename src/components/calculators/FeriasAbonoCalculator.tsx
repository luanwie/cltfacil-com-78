import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Switch } from "@/components/ui/switch";
import Notice from "@/components/ui/notice";
import { Separator } from "@/components/ui/separator";
import { Calculator, RotateCcw, DollarSign, Settings2 } from "lucide-react";
import { formatBRL } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { useUsageLimit } from "@/hooks/useUsageLimit";

type Resultado = {
  baseRemuneracao: string;
  diasGozo: number;
  diasVendidos: number;
  ferias: string;
  umTercoFerias: string;
  abono: string;
  umTercoAbono: string;
  totalBruto: string;
};

type ModoVenda = "auto" | "manual";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export default function FeriasAbonoCalculator() {
  const { toast } = useToast();

  // Gate global (4 grátis; PRO ilimitado)
  const { isPro, remaining, allowOrRedirect, incrementCount } = useUsageLimit();
  const overLimit = !isPro && (remaining ?? 0) <= 0;

  // Entradas
  const [salario, setSalario] = useState<number | undefined>();
  const [mediaVariaveis, setMediaVariaveis] = useState<number | undefined>();
  const [diasPeriodo, setDiasPeriodo] = useState<number | undefined>(30); // 0..30 (pode usar p/ proporcionais)
  const [modoVenda, setModoVenda] = useState<ModoVenda>("auto");
  const [diasVendidosManual, setDiasVendidosManual] = useState<number | undefined>();
  const [incluirTercoNoAbono, setIncluirTercoNoAbono] = useState<boolean>(false); // CCT/ACT pode prever

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const countingRef = useRef(false); // evita 2 contagens no mesmo clique

  function calcularInterno(): Resultado | null {
    const sal = Number(salario ?? 0);
    const varMed = Number(mediaVariaveis ?? 0);
    if (sal <= 0) return null;

    const diasVal = clamp(Number(diasPeriodo ?? 0), 0, 30);
    // base de remuneração de férias: salário + médias habituais (comissões, HE, adicionais etc.)
    const baseRem = sal + varMed;

    // Dias de gozo e dias vendidos
    const maxVendaveis = Math.min(10, Math.floor(diasVal / 3)); // “até 1/3”, limitado a 10 quando 30 dias
    const diasVendidos =
      modoVenda === "auto"
        ? maxVendaveis
        : clamp(Number(diasVendidosManual ?? 0), 0, maxVendaveis);

    const diasGozo = clamp(diasVal - diasVendidos, 0, 30);

    // Cálculos
    const valorDia = baseRem / 30;
    const feriasNum = valorDia * diasGozo;
    const umTercoFeriasNum = feriasNum / 3;

    const abonoNum = valorDia * diasVendidos;
    const umTercoAbonoNum = incluirTercoNoAbono ? abonoNum / 3 : 0;

    const totalBrutoNum = feriasNum + umTercoFeriasNum + abonoNum + umTercoAbonoNum;

    return {
      baseRemuneracao: formatBRL(baseRem),
      diasGozo,
      diasVendidos,
      ferias: formatBRL(feriasNum),
      umTercoFerias: formatBRL(umTercoFeriasNum),
      abono: formatBRL(abonoNum),
      umTercoAbono: formatBRL(umTercoAbonoNum),
      totalBruto: formatBRL(totalBrutoNum),
    };
  }

  async function handleCalcular() {
    // Gate global (redireciona se extrapolar)
    const ok = await allowOrRedirect();
    if (!ok) return;

    const res = calcularInterno();
    if (!res) {
      toast({
        title: "Preencha os campos",
        description: "Informe um salário válido (e, se houver, a média de variáveis).",
      });
      return;
    }

    setResultado(res);

    // incrementa uso apenas após cálculo OK
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
    setDiasPeriodo(30);
    setModoVenda("auto");
    setDiasVendidosManual(undefined);
    setIncluirTercoNoAbono(false);
    setResultado(null);
  }

  const canCalc = !!salario && (salario as number) > 0 && !overLimit;

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Calculadora de Férias + Abono
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Notice variant="info">
            A base das férias considera <strong>salário + média de variáveis habituais</strong>
            (comissões, horas extras, adicionais etc.). É possível “vender” até <strong>1/3</strong> do
            período de férias (máx. 10 dias quando o período é de 30).
          </Notice>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <Label htmlFor="variaveis">Média de variáveis (R$, opcional)</Label>
              <NumberInput
                id="variaveis"
                value={mediaVariaveis}
                onChange={setMediaVariaveis}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
              <p className="text-xs text-muted-foreground">
                Ex.: comissões/HE/adicionais habituais que entram na base.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dias">Dias de férias do período (0–30)</Label>
              <NumberInput
                id="dias"
                value={diasPeriodo}
                onChange={(v) => setDiasPeriodo(clamp(v ?? 0, 0, 30))}
                min={0}
                max={30}
                placeholder="30"
              />
              <p className="text-xs text-muted-foreground">
                Use &lt; 30 para proporcionais ou férias fracionadas.
              </p>
            </div>
          </div>

          <Separator />

          {/* Opções de venda (abono pecuniário) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Venda de 1/3 (abono pecuniário)
            </Label>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={modoVenda === "auto" ? "default" : "outline"}
                onClick={() => setModoVenda("auto")}
              >
                Automático (vender 1/3 permitido)
              </Button>
              <Button
                type="button"
                variant={modoVenda === "manual" ? "default" : "outline"}
                onClick={() => setModoVenda("manual")}
              >
                Manual (definir dias vendidos)
              </Button>
            </div>

            {modoVenda === "manual" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="diasVendidos">Dias vendidos (máx. 1/3)</Label>
                  <NumberInput
                    id="diasVendidos"
                    value={diasVendidosManual}
                    onChange={setDiasVendidosManual}
                    min={0}
                    max={10}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Máximo permitido: ⩽ 10 e ⩽ 1/3 de {diasPeriodo ?? 0} (auto-ajustado no cálculo).
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Switch
                id="terco-abono"
                checked={incluirTercoNoAbono}
                onCheckedChange={setIncluirTercoNoAbono}
              />
              <Label htmlFor="terco-abono" className="text-sm">
                Incluir <strong>1/3</strong> também sobre o valor do abono (use apenas se sua CCT/ACT prever)
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Por padrão, aplicamos o <strong>1/3 constitucional</strong> apenas sobre as férias gozadas. Algumas CCT/ACT podem prever
              1/3 também sobre o abono — por isso a opção acima.
            </p>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button onClick={handleCalcular} disabled={!canCalc} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              {overLimit ? "Limite atingido" : "Calcular Férias"}
            </Button>
            <Button variant="outline" onClick={limpar}>
              <RotateCcw className="w-4 h-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultado */}
      {resultado && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Resultado das Férias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-3 rounded border bg-background">
                <div className="text-sm text-muted-foreground">Base de remuneração</div>
                <div className="text-lg font-semibold">{resultado.baseRemuneracao}</div>
              </div>
              <div className="p-3 rounded border bg-background">
                <div className="text-sm text-muted-foreground">Dias (gozo / vendidos)</div>
                <div className="text-lg font-semibold">
                  {resultado.diasGozo} / {resultado.diasVendidos}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Férias ({resultado.diasGozo} dias):</span>
                <span>{resultado.ferias}</span>
              </div>
              <div className="flex justify-between">
                <span>1/3 sobre férias:</span>
                <span>{resultado.umTercoFerias}</span>
              </div>
              {resultado.diasVendidos > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>Abono (dias vendidos):</span>
                    <span>{resultado.abono}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1/3 sobre abono:</span>
                    <span>{resultado.umTercoAbono}</span>
                  </div>
                </>
              )}
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total bruto:</span>
                <span className="text-primary">{resultado.totalBruto}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Como calculamos */}
      <Card>
        <CardHeader>
          <CardTitle>Como Calculamos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div>
              <p className="font-medium">Base de remuneração</p>
              <p className="text-sm text-muted-foreground">
                Salário + média de variáveis habituais = {resultado?.baseRemuneracao}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div>
              <p className="font-medium">Férias e 1/3</p>
              <p className="text-sm text-muted-foreground">
                Férias = (Base ÷ 30) × dias de gozo; 1/3 = Férias ÷ 3.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div>
              <p className="font-medium">Abono e (opcional) 1/3</p>
              <p className="text-sm text-muted-foreground">
                Abono = (Base ÷ 30) × dias vendidos; 1/3 sobre abono é opcional, use apenas se sua CCT/ACT determinar.
              </p>
            </div>
          </div>
          <Notice>
            <strong>Atenção:</strong> Este resultado é <em>bruto</em> (não calcula INSS/IRRF). Prazos usuais:
            pagamento até 2 dias antes do início do gozo; abono deve ser solicitado até 15 dias antes do fim do período aquisitivo.
            Regras específicas podem variar por CCT/ACT.
          </Notice>
        </CardContent>
      </Card>
    </div>
  );
}
