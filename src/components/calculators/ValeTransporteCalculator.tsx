import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, RotateCcw, DollarSign, Bus, Building, Percent, Settings } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/currency";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useToast } from "@/hooks/use-toast";
import { PDFExportButton } from "@/components/ui/pdf-export-button";

type Resultado = {
  salario: string;
  modo: "simples" | "avancado";
  precoConducao?: string;
  precoIda?: string;
  precoVolta?: string;
  viagensValidadas: number;
  diasUteis: number;
  diasSemUso: number;
  diasConsiderados: number;

  custoDiario: string;
  custoVT: string;

  limitePercentual: string;
  limiteValor: string;

  descontoEmpregado: string;
  percentualDescontoSobreSalario: string;

  custoEmpresa: string;
  percentualCustoEmpresaSobreCusto: string;
};

const ValeTransporteCalculator = () => {
  const { isPro, remaining, allowOrRedirect, incrementCount } = useUsageLimit();
  const { toast } = useToast();
  const overLimit = !isPro && (remaining ?? 0) <= 0;

  // ---- Entradas principais
  const [salario, setSalario] = useState<number | undefined>();
  const [modo, setModo] = useState<"simples" | "avancado">("simples");

  // Preços
  const [precoConducao, setPrecoConducao] = useState<number | undefined>();     // modo simples
  const [precoIda, setPrecoIda] = useState<number | undefined>(undefined);      // modo avançado
  const [precoVolta, setPrecoVolta] = useState<number | undefined>(undefined);  // modo avançado

  // Jornada de uso
  const [viagensPorDia, setViagensPorDia] = useState<number | undefined>(2); // padrão ida + volta
  const [diasUteis, setDiasUteis] = useState<number | undefined>(22);
  const [diasSemUso, setDiasSemUso] = useState<number | undefined>(0);       // home office/férias/ausências

  // Política de desconto empregado
  const [limitePercentualEmpregado, setLimitePercentualEmpregado] = useState<number | undefined>(6); // % do salário (máx. legal 6; empresa pode aplicar menor)

  const [resultado, setResultado] = useState<Resultado | null>(null);

  const calcular = async () => {
    // validações mínimas
    if (!salario || salario <= 0) return;
    if (modo === "simples" && (!precoConducao || precoConducao <= 0)) return;
    if (modo === "avancado" && ((!precoIda || precoIda <= 0) || (!precoVolta || precoVolta <= 0))) return;

    if (!(await allowOrRedirect())) return;

    const viagens = Math.max(1, Math.round(viagensPorDia || 2));
    const diasTotal = Math.max(1, Math.round(diasUteis || 22));
    const semUso = Math.max(0, Math.round(diasSemUso || 0));
    const diasConsiderados = Math.max(0, diasTotal - semUso);

    // custo diário
    let custoDiarioNum = 0;
    if (modo === "simples") {
      custoDiarioNum = (precoConducao as number) * viagens;
    } else {
      // por padrão 2 viagens (ida + volta). Se usuário informar mais viagens por dia (integrações),
      // escalonamos proporcionalmente ao par ida+volta.
      const baseIdaVolta = (precoIda as number) + (precoVolta as number); // 2 viagens
      custoDiarioNum = baseIdaVolta * (viagens / 2);
    }

    const custoVTNum = custoDiarioNum * diasConsiderados;

    // limite de desconto do empregado
    const limitePerc = Math.min(6, Math.max(0, limitePercentualEmpregado || 6)); // nunca > 6% por regra
    const limiteValor = (salario as number) * (limitePerc / 100);

    // desconto empregado é o menor entre o limite e o custo total
    const descontoEmpregadoNum = Math.min(limiteValor, custoVTNum);
    const custoEmpresaNum = Math.max(0, custoVTNum - descontoEmpregadoNum);

    // <<< Incrementa uso
    await incrementCount();

    setResultado({
      salario: formatBRL(salario as number),
      modo,
      precoConducao: modo === "simples" ? formatBRL(precoConducao as number) : undefined,
      precoIda: modo === "avancado" ? formatBRL(precoIda as number) : undefined,
      precoVolta: modo === "avancado" ? formatBRL(precoVolta as number) : undefined,
      viagensValidadas: viagens,
      diasUteis: diasTotal,
      diasSemUso: semUso,
      diasConsiderados,

      custoDiario: formatBRL(custoDiarioNum),
      custoVT: formatBRL(custoVTNum),

      limitePercentual: formatPercent(limitePerc / 100),
      limiteValor: formatBRL(limiteValor),

      descontoEmpregado: formatBRL(descontoEmpregadoNum),
      percentualDescontoSobreSalario: formatPercent(descontoEmpregadoNum / (salario as number)),

      custoEmpresa: formatBRL(custoEmpresaNum),
      percentualCustoEmpresaSobreCusto: custoVTNum > 0 ? formatPercent(custoEmpresaNum / custoVTNum) : formatPercent(0),
    });
  };

  const limpar = () => {
    setSalario(undefined);
    setModo("simples");
    setPrecoConducao(undefined);
    setPrecoIda(undefined);
    setPrecoVolta(undefined);
    setViagensPorDia(2);
    setDiasUteis(22);
    setDiasSemUso(0);
    setLimitePercentualEmpregado(6);
    setResultado(null);
  };

  const disabled =
    overLimit ||
    !salario ||
    salario <= 0 ||
    (modo === "simples" ? !precoConducao || precoConducao <= 0 : !precoIda || !precoVolta || precoIda <= 0 || precoVolta <= 0);

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cálculo de Vale-Transporte
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Modo de cálculo */}
          <div className="space-y-2">
            <Label>Modo de cálculo</Label>
            <Select value={modo} onValueChange={(v) => setModo(v as "simples" | "avancado")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simples">Simples (preço único por viagem)</SelectItem>
                <SelectItem value="avancado">Avançado (ida e volta com preços próprios)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salario">Salário (base para limite de %)</Label>
              <NumberInput
                id="salario"
                value={salario}
                onChange={setSalario}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
              <p className="text-xs text-muted-foreground">O desconto do empregado respeita no máximo {formatPercent(0.06)} do salário.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limite">Limite de desconto do empregado</Label>
              <NumberInput
                id="limite"
                value={limitePercentualEmpregado}
                onChange={setLimitePercentualEmpregado}
                decimal={false}
                min={0}
                max={6}
                suffix="%"
                placeholder="6"
              />
              <p className="text-xs text-muted-foreground">Empresas podem adotar limite menor que 6% por política interna.</p>
            </div>
          </div>

          {/* Bloco de preços */}
          {modo === "simples" ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="preco-conducao">Preço por viagem (tarifa única)</Label>
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
                <p className="text-xs text-muted-foreground">Ida + volta = 2. Ajuste se houver integrações.</p>
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
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="preco-ida">Tarifa – Ida</Label>
                <NumberInput
                  id="preco-ida"
                  value={precoIda}
                  onChange={setPrecoIda}
                  prefix="R$"
                  decimal
                  min={0}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco-volta">Tarifa – Volta</Label>
                <NumberInput
                  id="preco-volta"
                  value={precoVolta}
                  onChange={setPrecoVolta}
                  prefix="R$"
                  decimal
                  min={0}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="viagens-dia-adv">Viagens por dia</Label>
                <NumberInput
                  id="viagens-dia-adv"
                  value={viagensPorDia}
                  onChange={setViagensPorDia}
                  min={1}
                  placeholder="2"
                />
                <p className="text-xs text-muted-foreground">Se &gt; 2, ajustamos proporcionalmente ao par ida/volta.</p>
              </div>

              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="dias-uteis-adv">Dias úteis no mês</Label>
                <NumberInput
                  id="dias-uteis-adv"
                  value={diasUteis}
                  onChange={setDiasUteis}
                  min={1}
                  max={31}
                  placeholder="22"
                />
              </div>
            </div>
          )}

          {/* Ajustes de dias */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dias-sem-uso">Dias sem uso (home office/ausências)</Label>
              <NumberInput
                id="dias-sem-uso"
                value={diasSemUso}
                onChange={setDiasSemUso}
                min={0}
                max={31}
                placeholder="0"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Settings className="w-4 h-4" />
              Informe dias sem uso para reduzir o custo total daquele mês.
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={calcular} disabled={disabled} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              {overLimit ? "Limite atingido" : "Calcular Vale-Transporte"}
            </Button>
            <Button variant="outline" onClick={limpar}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {resultado && (
        <div className="space-y-4">
          {/* Cards principais */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Bus className="w-4 h-4" />
                  Custo Total do VT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resultado.custoVT}</div>
                <p className="text-xs text-muted-foreground">
                  {resultado.viagensValidadas} viagens/dia • {resultado.diasConsiderados} dias
                </p>
                <p className="text-xs text-muted-foreground">Custo diário: {resultado.custoDiario}</p>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Desconto do Empregado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{resultado.descontoEmpregado}</div>
                <p className="text-xs text-muted-foreground">
                  Efetivo: {resultado.percentualDescontoSobreSalario} sobre o salário (limite {resultado.limitePercentual})
                </p>
                <p className="text-xs text-muted-foreground">Limite em R$: {resultado.limiteValor}</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Custo da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{resultado.custoEmpresa}</div>
                <p className="text-xs text-muted-foreground">
                  {resultado.percentualCustoEmpresaSobreCusto} do custo total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Resumo final */}
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
                    <div className="text-sm text-muted-foreground">Salário informado</div>
                    <div className="font-medium">{resultado.salario}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <div className="text-sm text-muted-foreground">Limite do empregado</div>
                    <div className="font-medium">
                      {resultado.limitePercentual} ({resultado.limiteValor})
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Como calculamos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Como Calculamos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <strong>1) Custo diário:</strong>{" "}
                {resultado.modo === "simples"
                  ? `tarifa única × viagens/dia = ${resultado.custoDiario}`
                  : `ida + volta (ajustado pelas viagens/dia) = ${resultado.custoDiario}`}
              </p>
              <p>
                <strong>2) Custo mensal:</strong> custo diário × dias considerados ({resultado.diasUteis} úteis − {resultado.diasSemUso} sem uso).
              </p>
              <p>
                <strong>3) Desconto empregado:</strong> menor entre {formatPercent(0.06)} do salário (ou limite escolhido) e o custo mensal.
              </p>
              <p>
                <strong>4) Custo empresa:</strong> custo mensal − desconto do empregado.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botão Exportar PDF */}
      {resultado && (
        <div className="flex justify-center">
          <PDFExportButton
            calculatorName="Calculadora de Vale Transporte"
            results={[
              { label: "Salário Base", value: resultado.salario },
              { label: "Custo Diário", value: resultado.custoDiario },
              { label: "Custo VT", value: resultado.custoVT },
              { label: "Desconto Empregado", value: resultado.descontoEmpregado },
              { label: "Custo Empresa", value: resultado.custoEmpresa },
              { label: "Limite Desconto", value: resultado.limiteValor },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default ValeTransporteCalculator;
