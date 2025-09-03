import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calculator, Info, DollarSign, RotateCcw } from "lucide-react";

import { NumberInput } from "@/components/ui/number-input";
import { formatBRL } from "@/lib/currency";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import { useNavigate, useLocation } from "react-router-dom";
import { ensureCanCalculate } from "@/utils/usageGuard";
import { incrementCalcIfNeeded } from "@/utils/incrementCalc";

// ---------------- utils de datas/contas ----------------
const diaMs = 24 * 60 * 60 * 1000;

function diffDiasIncl(a: Date, b: Date) {
  return Math.floor((b.getTime() - a.getTime()) / diaMs) + 1;
}

function mesesEntreCom15Dias(adm: Date, fim: Date, anoRef: number) {
  let avos = 0;
  for (let m = 0; m < 12; m++) {
    const ini = new Date(anoRef, m, 1);
    const fimMes = new Date(anoRef, m + 1, 0);
    if (fimMes < adm || ini > fim) continue;
    const from = new Date(Math.max(ini.getTime(), adm.getTime()));
    const to = new Date(Math.min(fimMes.getTime(), fim.getTime()));
    if (diffDiasIncl(from, to) >= 15) avos++;
  }
  return avos;
}

function mesesAquisitivo(adm: Date, deslig: Date) {
  const thisYear = new Date(deslig.getFullYear(), adm.getMonth(), adm.getDate());
  const inicio = thisYear > deslig
    ? new Date(deslig.getFullYear() - 1, adm.getMonth(), adm.getDate())
    : thisYear;
  let m = 0;
  let cursor = new Date(inicio);
  while (true) {
    const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
    if (next > deslig) {
      if (diffDiasIncl(cursor, deslig) >= 15) m++;
      break;
    } else {
      m++;
      cursor = next;
    }
  }
  return Math.max(0, Math.min(12, m));
}

function avisoDiasAuto(adm: Date, deslig: Date) {
  const anos = Math.max(0, Math.floor((deslig.getTime() - adm.getTime()) / (365.25 * diaMs)));
  const extra = Math.max(0, anos - 1) * 3;
  return Math.min(90, 30 + extra);
}

const salarioDia = (salario: number) => salario / 30;

// ---------------- cálculo puro ----------------
type Resultado = ReturnType<typeof computeRescisao> | null;

function computeRescisao(params: {
  tipoRescisao: string;
  salario: number;
  adm: Date;
  deslig: Date;
  modoAvisoPrevio: string;
  diasAviso: number;
  feriasVencidasDiasNum: number;
  saldoFgtsInformado: number;
  descontarAvisoNaoCumprido: boolean;
  outrosDescontos: number;
}) {
  const {
    tipoRescisao: tipo,
    salario,
    adm,
    deslig,
    modoAvisoPrevio: modoAviso,
    diasAviso,
    feriasVencidasDiasNum,
    saldoFgtsInformado,
    descontarAvisoNaoCumprido,
    outrosDescontos,
  } = params;

  // 1) Saldo de salário (dias do mês até a data de desligamento)
  const inicioMes = new Date(deslig.getFullYear(), deslig.getMonth(), 1);
  const diasTrabalhadosMes = diffDiasIncl(inicioMes, deslig);
  const saldoSalario = salarioDia(salario) * diasTrabalhadosMes;

  // 2) 13º proporcional (exceto justa causa)
  const avos13 = mesesEntreCom15Dias(adm, deslig, deslig.getFullYear());
  const decimoTerceiro = tipo === "justa_causa" ? 0 : salario * (avos13 / 12);

  // 3) Férias vencidas + 1/3 (se houver dias informados)
  const diasFV = Math.max(0, Math.min(30, feriasVencidasDiasNum));
  const valorFeriasVencidas = salarioDia(salario) * diasFV;
  const umTercoFV = valorFeriasVencidas / 3;
  const feriasVencidasComTerco = valorFeriasVencidas + umTercoFV;

  // 4) Férias proporcionais + 1/3 (exceto justa causa)
  const mesesAq = tipo === "justa_causa" ? 0 : mesesAquisitivo(adm, deslig);
  const diasFeriasProp = Math.floor(mesesAq * 2.5);
  const valorFeriasProp = salarioDia(salario) * diasFeriasProp;
  const umTercoFP = valorFeriasProp / 3;
  const feriasProporcionaisComTerco = tipo === "justa_causa" ? 0 : valorFeriasProp + umTercoFP;

  // 5) Aviso prévio (regras por tipo)
  let avisoValor = 0;
  if (tipo === "sem_justa_causa") {
    avisoValor = modoAviso === "indenizado" ? salarioDia(salario) * diasAviso : 0;
  } else if (tipo === "acordo") {
    avisoValor = modoAviso === "indenizado" ? (salarioDia(salario) * diasAviso) * 0.5 : 0;
  } else if (tipo === "pedido_demissao") {
    // desconto se não cumpriu aviso trabalhado (até 30 dias)
    avisoValor =
      modoAviso === "trabalhado" && descontarAvisoNaoCumprido
        ? -(salarioDia(salario) * Math.min(30, diasAviso || 30))
        : 0;
  } else {
    // término de contrato / justa causa: sem aviso por padrão
    avisoValor = 0;
  }

  // 6) Multa do FGTS (sobre saldo informado)
  let multaFgts = 0;
  if (saldoFgtsInformado > 0) {
    if (tipo === "sem_justa_causa") multaFgts = saldoFgtsInformado * 0.40;
    else if (tipo === "acordo") multaFgts = saldoFgtsInformado * 0.20;
  }

  // 7) Total estimado (bruto) e total após “outros descontos”
  const totalBruto =
    saldoSalario +
    decimoTerceiro +
    feriasVencidasComTerco +
    feriasProporcionaisComTerco +
    avisoValor +
    multaFgts;

  const totalEstimado = totalBruto - Math.max(0, outrosDescontos || 0);

  // 8) Informativos (saque FGTS / seguro-desemprego)
  const saqueFgts =
    tipo === "sem_justa_causa" ? "Sim (100%)"
    : tipo === "acordo" ? "Parcial (até 80%)"
    : "Não";

  const seguroDesemprego =
    tipo === "sem_justa_causa" ? "Elegível (regras do programa)"
    : "Não elegível";

  return {
    saldoSalario,
    decimoTerceiro,
    feriasVencidasComTerco,
    feriasProporcionaisComTerco,
    avisoValor,
    multaFgts,
    totalBruto,
    totalEstimado,
    saqueFgts,
    seguroDesemprego,
    detalhes: {
      diasTrabalhadosMes,
      avos13,
      feriasVencidasDiasNum: diasFV,
      mesesAq,
      diasFeriasProp,
      diasAviso,
      outrosDescontos: Math.max(0, outrosDescontos || 0),
    },
  };
}

// ---------------- componente ----------------
const RescisaoCalculator = () => {
  const [tipoRescisao, setTipoRescisao] = useState("");
  const [salarioBase, setSalarioBase] = useState<number | undefined>();
  const [dataAdmissao, setDataAdmissao] = useState("");
  const [dataDesligamento, setDataDesligamento] = useState("");
  const [modoAvisoPrevio, setModoAvisoPrevio] = useState("indenizado");
  const [overrideDiasAviso, setOverrideDiasAviso] = useState<number | undefined>(undefined);
  const [descontarAviso, setDescontarAviso] = useState(false);
  const [feriasVencidasDias, setFeriasVencidasDias] = useState<number | undefined>(0);
  const [saldoFgts, setSaldoFgts] = useState<number | undefined>(0);
  const [outrosDescontos, setOutrosDescontos] = useState<number | undefined>(0);
  const [mostrarDetalhe, setMostrarDetalhe] = useState(false);

  const [resultado, setResultado] = useState<Resultado>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();
  const { canUse, isPro, remaining, isLogged } = ctx;

  const isValid =
    !!tipoRescisao && !!salarioBase && salarioBase > 0 && !!dataAdmissao && !!dataDesligamento;

  // dias de aviso sugerido
  let diasAvisoAuto = 30;
  if (dataAdmissao && dataDesligamento) {
    try {
      const adm = new Date(dataAdmissao);
      const desl = new Date(dataDesligamento);
      diasAvisoAuto = avisoDiasAuto(adm, desl);
    } catch {}
  }

  const showDescontarAviso =
    tipoRescisao === "pedido_demissao" && modoAvisoPrevio === "trabalhado";

  const handleCalculate = async () => {
    if (!isValid) return;

    const ok = await ensureCanCalculate({
      ...ctx,
      navigate,
      currentPath: location.pathname,
      focusUsage: () =>
        document.getElementById("usage-banner")?.scrollIntoView({ behavior: "smooth" }),
    });
    if (!ok) return;

    try {
      const salario = salarioBase ?? 0;
      const adm = new Date(dataAdmissao);
      const deslig = new Date(dataDesligamento);
      const diasAviso =
        typeof overrideDiasAviso === "number" && overrideDiasAviso >= 0
          ? overrideDiasAviso
          : diasAvisoAuto;

      const res = computeRescisao({
        tipoRescisao,
        salario,
        adm,
        deslig,
        modoAvisoPrevio,
        diasAviso,
        feriasVencidasDiasNum: Math.max(0, Math.min(30, feriasVencidasDias ?? 0)),
        saldoFgtsInformado: Math.max(0, saldoFgts ?? 0),
        descontarAvisoNaoCumprido: !!descontarAviso,
        outrosDescontos: Math.max(0, outrosDescontos ?? 0),
      });

      await incrementCalcIfNeeded(isPro);
      setResultado(res);
    } catch {
      setResultado(null);
    }
  };

  const limpar = () => {
    setTipoRescisao("");
    setSalarioBase(undefined);
    setDataAdmissao("");
    setDataDesligamento("");
    setModoAvisoPrevio("indenizado");
    setOverrideDiasAviso(undefined);
    setDescontarAviso(false);
    setFeriasVencidasDias(0);
    setSaldoFgts(0);
    setOutrosDescontos(0);
    setMostrarDetalhe(false);
    setResultado(null);
  };

  const tiposRescisao = [
    { value: "sem_justa_causa", label: "Sem justa causa (empregador)" },
    { value: "pedido_demissao", label: "Pedido de demissão" },
    { value: "acordo", label: "Acordo entre as partes (art. 484-A)" },
    { value: "termino_contrato", label: "Término de contrato determinado" },
    { value: "justa_causa", label: "Justa causa (empregado)" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Dados da Rescisão
          </CardTitle>
          <CardDescription>Preencha as informações do contrato e tipo de rescisão</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de rescisão *</Label>
              <Select value={tipoRescisao} onValueChange={setTipoRescisao}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposRescisao.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Salário base mensal (R$) *</Label>
              <NumberInput
                value={salarioBase}
                onChange={setSalarioBase}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label>Data de admissão *</Label>
              <input
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                type="date"
                value={dataAdmissao}
                onChange={(e) => setDataAdmissao(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Data de desligamento *</Label>
              <input
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                type="date"
                value={dataDesligamento}
                onChange={(e) => setDataDesligamento(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Aviso Prévio</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Modo</Label>
                <Select value={modoAvisoPrevio} onValueChange={setModoAvisoPrevio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trabalhado">Trabalhado</SelectItem>
                    <SelectItem value="indenizado">Indenizado</SelectItem>
                    <SelectItem value="nao">Não se aplica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dias de aviso (auto: {diasAvisoAuto})</Label>
                <NumberInput
                  value={overrideDiasAviso}
                  onChange={setOverrideDiasAviso}
                  min={0}
                  max={90}
                  placeholder={String(diasAvisoAuto)}
                />
              </div>

              {showDescontarAviso && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="descontar"
                    checked={descontarAviso}
                    onCheckedChange={(checked) => setDescontarAviso(checked === true)}
                  />
                  <Label htmlFor="descontar">Descontar aviso não cumprido</Label>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Férias vencidas (dias)</Label>
              <NumberInput
                value={feriasVencidasDias}
                onChange={setFeriasVencidasDias}
                min={0}
                max={30}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Saldo FGTS informado (R$) — opcional</Label>
              <NumberInput
                value={saldoFgts}
                onChange={setSaldoFgts}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label>Outros descontos (R$)</Label>
              <NumberInput
                value={outrosDescontos}
                onChange={setOutrosDescontos}
                prefix="R$"
                decimal
                min={0}
                placeholder="0,00"
              />
              <p className="text-xs text-muted-foreground">
                Adiantamentos, faltas ou descontos diversos aplicáveis na rescisão.
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center space-x-2">
            <Switch id="detalhe" checked={mostrarDetalhe} onCheckedChange={setMostrarDetalhe} />
            <Label htmlFor="detalhe">Mostrar detalhe de contas</Label>
          </div>

          {/* Banner global/CTA PRO (padrão do projeto) */}
          <div id="usage-banner" className="mt-2">
            {/* Use o mesmo componente de banner da página se quiser exibir aqui também */}
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleCalculate} disabled={!isValid || !canUse} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              {!canUse ? "Limite atingido" : "Calcular Rescisão"}
            </Button>
            <Button variant="outline" onClick={limpar}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {resultado && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Saldo de Salário</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {formatBRL(resultado.saldoSalario)}
                </p>
                {mostrarDetalhe && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {resultado.detalhes.diasTrabalhadosMes} dias trabalhados no mês
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">13º Proporcional</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {formatBRL(resultado.decimoTerceiro)}
                </p>
                {mostrarDetalhe && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {resultado.detalhes.avos13}/12 avos
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Férias Vencidas + 1/3</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {formatBRL(resultado.feriasVencidasComTerco)}
                </p>
                {mostrarDetalhe && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {resultado.detalhes.feriasVencidasDiasNum} dias informados
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Férias Proporcionais + 1/3</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {formatBRL(resultado.feriasProporcionaisComTerco)}
                </p>
                {mostrarDetalhe && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {resultado.detalhes.mesesAq} meses = {resultado.detalhes.diasFeriasProp} dias
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Aviso Prévio {resultado.avisoValor < 0 ? "(Desconto)" : "(Indenizado)"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-bold ${
                    resultado.avisoValor >= 0 ? "text-primary" : "text-destructive"
                  }`}
                >
                  {formatBRL(resultado.avisoValor)}
                </p>
                {mostrarDetalhe && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {resultado.detalhes.diasAviso} dias
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Multa FGTS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {formatBRL(resultado.multaFgts)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Total Estimado {resultado.totalEstimado >= 0 ? "a Receber" : "a Pagar"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p
                  className={`text-3xl font-bold ${
                    resultado.totalEstimado >= 0 ? "text-primary" : "text-destructive"
                  }`}
                >
                  {formatBRL(resultado.totalEstimado)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Valor bruto consolidado − “Outros descontos”
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Saque FGTS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">{resultado.saqueFgts}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seguro-Desemprego</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">{resultado.seguroDesemprego}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Como Calculamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>1. Saldo de Salário:</strong> dias trabalhados no mês ÷ 30 × salário.
              </p>
              <p>
                <strong>2. 13º Proporcional:</strong> avos com 15+ dias no ano ÷ 12 × salário.
              </p>
              <p>
                <strong>3. Férias:</strong> vencidas (dias informados) + proporcionais (meses×2,5) com 1/3.
              </p>
              <p>
                <strong>4. Aviso Prévio:</strong> 30 dias + 3 dias por ano após o 1º (máx. 90). No 484-A metade do aviso indenizado.
              </p>
              <p className="text-sm text-muted-foreground">
                Os valores exibidos são estimativas brutas. Descontos legais (INSS/IRRF) variam conforme
                o caso. Informe “Outros descontos” para aproximar o líquido ou ative o modo avançado futuramente.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default RescisaoCalculator;
