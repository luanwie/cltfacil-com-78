import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, Info, DollarSign, RotateCcw, AlertCircle } from "lucide-react";

import { NumberInput } from "@/components/ui/number-input";
import { formatBRL } from "@/lib/currency";
import { useUsageLimit } from "@/hooks/useUsageLimit";

// Constantes CLT 2025
const SALARIO_MINIMO_2025 = 1518.00;
const ALIQUOTA_FGTS = 0.08;

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

  // 7) Total estimado (bruto) e total após "outros descontos"
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { allowOrRedirect, incrementCount, remaining, isPro, loading } = useUsageLimit();

  // Validação com mensagens de erro
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!tipoRescisao) {
      newErrors.tipoRescisao = "Selecione o tipo de rescisão";
    }
    
    if (!salarioBase || salarioBase <= 0) {
      newErrors.salarioBase = "Informe um salário válido";
    } else if (salarioBase < SALARIO_MINIMO_2025) {
      newErrors.salarioBase = `Salário não pode ser inferior ao mínimo (${formatBRL(SALARIO_MINIMO_2025)})`;
    }
    
    if (!dataAdmissao) {
      newErrors.dataAdmissao = "Informe a data de admissão";
    }
    
    if (!dataDesligamento) {
      newErrors.dataDesligamento = "Informe a data de desligamento";
    }
    
    if (dataAdmissao && dataDesligamento) {
      const adm = new Date(dataAdmissao);
      const desl = new Date(dataDesligamento);
      
      if (desl <= adm) {
        newErrors.dataDesligamento = "Data de desligamento deve ser posterior à admissão";
      }
      
      if (desl > new Date()) {
        newErrors.dataDesligamento = "Data de desligamento não pode ser futura";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    if (!validateForm() || loading) return;

    const canCalculate = await allowOrRedirect();
    if (!canCalculate) return;

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

      await incrementCount();
      setResultado(res);
      setErrors({}); // Limpa erros após cálculo bem-sucedido
    } catch (error) {
      console.error("Erro no cálculo:", error);
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
    setErrors({});
  };

  const tiposRescisao = [
    { value: "sem_justa_causa", label: "Demissão sem justa causa", desc: "Iniciativa do empregador" },
    { value: "pedido_demissao", label: "Pedido de demissão", desc: "Iniciativa do empregado" },
    { value: "acordo", label: "Acordo mútuo (CLT 484-A)", desc: "Acordo entre empregador e empregado" },
    { value: "termino_contrato", label: "Término de contrato determinado", desc: "Fim do prazo contratual" },
    { value: "justa_causa", label: "Demissão por justa causa", desc: "Falta grave do empregado" },
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
        <CardContent className="space-y-6">
          {/* Validação geral */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Por favor, corrija os erros nos campos destacados abaixo.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Tipo de rescisão *</Label>
              <Select value={tipoRescisao} onValueChange={setTipoRescisao}>
                <SelectTrigger className={errors.tipoRescisao ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione o tipo de rescisão" />
                </SelectTrigger>
                <SelectContent>
                  {tiposRescisao.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      <div>
                        <div className="font-medium">{tipo.label}</div>
                        <div className="text-sm text-muted-foreground">{tipo.desc}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipoRescisao && (
                <p className="text-sm text-destructive">{errors.tipoRescisao}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Salário base mensal (R$) *</Label>
              <NumberInput
                value={salarioBase}
                onChange={setSalarioBase}
                prefix="R$"
                decimal
                min={0}
                placeholder="Ex: 1.518,00"
                className={errors.salarioBase ? "border-destructive" : ""}
              />
              {errors.salarioBase && (
                <p className="text-sm text-destructive">{errors.salarioBase}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Salário mínimo 2025: {formatBRL(SALARIO_MINIMO_2025)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Data de admissão *</Label>
              <input
                className={`w-full h-11 rounded-md border bg-background px-3 py-2 text-sm ${
                  errors.dataAdmissao ? "border-destructive" : "border-input"
                }`}
                type="date"
                value={dataAdmissao}
                onChange={(e) => setDataAdmissao(e.target.value)}
              />
              {errors.dataAdmissao && (
                <p className="text-sm text-destructive">{errors.dataAdmissao}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Data de desligamento *</Label>
              <input
                className={`w-full h-11 rounded-md border bg-background px-3 py-2 text-sm ${
                  errors.dataDesligamento ? "border-destructive" : "border-input"
                }`}
                type="date"
                value={dataDesligamento}
                onChange={(e) => setDataDesligamento(e.target.value)}
              />
              {errors.dataDesligamento && (
                <p className="text-sm text-destructive">{errors.dataDesligamento}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Aviso Prévio</h3>
              <p className="text-sm text-muted-foreground">
                Configurações específicas do aviso prévio conforme CLT 2025
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Modalidade</Label>
                <Select value={modoAvisoPrevio} onValueChange={setModoAvisoPrevio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trabalhado">
                      <div>
                        <div>Trabalhado</div>
                        <div className="text-xs text-muted-foreground">Empregado cumpre aviso</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="indenizado">
                      <div>
                        <div>Indenizado</div>
                        <div className="text-xs text-muted-foreground">Empresa paga o aviso</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="nao">
                      <div>
                        <div>Não se aplica</div>
                        <div className="text-xs text-muted-foreground">Sem direito ao aviso</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dias de aviso</Label>
                <NumberInput
                  value={overrideDiasAviso}
                  onChange={setOverrideDiasAviso}
                  min={0}
                  max={90}
                  placeholder={`Padrão: ${diasAvisoAuto} dias`}
                />
                <p className="text-xs text-muted-foreground">
                  CLT: 30 dias + 3 por ano (máx. 90)
                </p>
              </div>

              {showDescontarAviso && (
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="descontar"
                    checked={descontarAviso}
                    onCheckedChange={(checked) => setDescontarAviso(checked === true)}
                  />
                  <Label htmlFor="descontar" className="text-sm">
                    Descontar aviso não cumprido
                  </Label>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Informações Complementares</h3>
              <p className="text-sm text-muted-foreground">
                Dados adicionais para cálculo preciso da rescisão
              </p>
            </div>

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
                <p className="text-xs text-muted-foreground">
                  Férias já adquiridas não gozadas
                </p>
              </div>

              <div className="space-y-2">
                <Label>Saldo FGTS (R$)</Label>
                <NumberInput
                  value={saldoFgts}
                  onChange={setSaldoFgts}
                  prefix="R$"
                  decimal
                  min={0}
                  placeholder="0,00"
                />
                <p className="text-xs text-muted-foreground">
                  Para cálculo da multa FGTS (40% ou 20%)
                </p>
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
                  Adiantamentos, faltas, etc.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center space-x-2">
            <Switch id="detalhe" checked={mostrarDetalhe} onCheckedChange={setMostrarDetalhe} />
            <Label htmlFor="detalhe">Mostrar detalhe de contas</Label>
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={handleCalculate} 
              disabled={loading || (remaining !== null && remaining <= 0)} 
              className="flex-1 h-12 text-base font-medium"
              size="lg"
            >
              <Calculator className="w-5 h-5 mr-2" />
              {loading ? "Calculando..." : remaining !== null && remaining <= 0 ? "Limite atingido" : "Calcular Rescisão"}
            </Button>
            <Button variant="outline" onClick={limpar} className="h-12" size="lg">
              <RotateCcw className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Limpar</span>
            </Button>
          </div>
          
          {remaining !== null && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {remaining > 0 ? `${remaining} cálculo${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}` : 'Limite de cálculos atingido'}
                {!isPro && (
                  <span className="text-primary font-medium"> • Assine PRO para cálculos ilimitados</span>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {resultado && (
        <>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-center mb-4">Resultado da Rescisão</h2>
              <p className="text-center text-muted-foreground text-sm">
                Valores calculados conforme CLT 2025 • Base: {formatBRL(salarioBase ?? 0)}
              </p>
            </div>

            {/* Cards dos componentes individuais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-blue-700">Saldo de Salário</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatBRL(resultado.saldoSalario)}
                  </p>
                  {mostrarDetalhe && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {resultado.detalhes.diasTrabalhadosMes} dias trabalhados no mês
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-green-700">13º Proporcional</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    {formatBRL(resultado.decimoTerceiro)}
                  </p>
                  {mostrarDetalhe && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {resultado.detalhes.avos13}/12 avos proporcionais
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-purple-700">Férias Vencidas + 1/3</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatBRL(resultado.feriasVencidasComTerco)}
                  </p>
                  {mostrarDetalhe && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {resultado.detalhes.feriasVencidasDiasNum} dias informados
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-indigo-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-indigo-700">Férias Proporcionais + 1/3</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-indigo-600">
                    {formatBRL(resultado.feriasProporcionaisComTerco)}
                  </p>
                  {mostrarDetalhe && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {resultado.detalhes.mesesAq} meses = {resultado.detalhes.diasFeriasProp} dias
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-orange-700">
                    Aviso Prévio {resultado.avisoValor < 0 ? "(Desconto)" : "(Indenizado)"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-2xl font-bold ${
                      resultado.avisoValor >= 0 ? "text-orange-600" : "text-red-600"
                    }`}
                  >
                    {formatBRL(resultado.avisoValor)}
                  </p>
                  {mostrarDetalhe && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {resultado.detalhes.diasAviso} dias de aviso
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-amber-700">Multa FGTS</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-amber-600">
                    {formatBRL(resultado.multaFgts)}
                  </p>
                  {mostrarDetalhe && saldoFgts && saldoFgts > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {tipoRescisao === "sem_justa_causa" ? "40%" : tipoRescisao === "acordo" ? "20%" : "0%"} sobre {formatBRL(saldoFgts)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Total destacado */}
            <Card className="border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                  <DollarSign className="w-7 h-7 text-primary" />
                  Total Estimado {resultado.totalEstimado >= 0 ? "a Receber" : "a Pagar"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <p
                  className={`text-4xl font-bold ${
                    resultado.totalEstimado >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatBRL(resultado.totalEstimado)}
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Valor bruto: {formatBRL(resultado.totalBruto)}</p>
                  {outrosDescontos && outrosDescontos > 0 && (
                    <p>Outros descontos: -{formatBRL(outrosDescontos)}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informações adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    Saque FGTS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-blue-700">{resultado.saqueFgts}</p>
                    {tipoRescisao === "acordo" && (
                      <p className="text-sm text-muted-foreground">
                        No acordo mútuo você pode sacar até 80% do saldo FGTS
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="w-5 h-5 text-green-600" />
                    Seguro-Desemprego
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-green-700">{resultado.seguroDesemprego}</p>
                    {resultado.seguroDesemprego.includes("Elegível") && (
                      <p className="text-sm text-muted-foreground">
                        Solicite entre 7 e 120 dias após a demissão
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Explicação dos cálculos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Como Calculamos (CLT 2025)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-blue-700 mb-2">Parcelas Principais:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• <strong>Saldo Salário:</strong> dias trabalhados no mês ÷ 30 × salário</li>
                      <li>• <strong>13º Proporcional:</strong> meses com 15+ dias ÷ 12 × salário</li>
                      <li>• <strong>Férias:</strong> vencidas + proporcionais (2,5 dias/mês) + 1/3</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-orange-700 mb-2">Aviso Prévio & FGTS:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• <strong>Aviso:</strong> 30 dias + 3 dias/ano (máx. 90 dias)</li>
                      <li>• <strong>Acordo 484-A:</strong> 50% do aviso indenizado</li>
                      <li>• <strong>Multa FGTS:</strong> 40% (demissão) ou 20% (acordo)</li>
                    </ul>
                  </div>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Importante:</strong> Valores são estimativas brutas. Descontos de INSS e IRRF podem incidir 
                    sobre algumas parcelas. Para cálculos específicos, consulte um profissional especializado.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default RescisaoCalculator;