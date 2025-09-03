import { useState } from "react";
import { Calculator, RotateCcw, Clock, DollarSign, Percent, Calendar, Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import Notice from "@/components/ui/notice";
import { useToast } from "@/hooks/use-toast";
import { useUsageLimit } from "@/hooks/useUsageLimit";

type TipoAtividade = "urbano" | "rural_lavoura" | "rural_pecuaria";

interface CalculationInputs {
  salarioBase?: number;             // mensal
  jornada: number;                  // horas/mês (ex.: 220)
  percentualAdicional: number;      // 20% urbano (padrão), 25% rural (se aplicável pela CCT)
  // Modo 1: horas diretas
  horasNoturnas?: number;           // em horas
  // Modo 2: por horários
  inicio?: string;                  // "HH:MM"
  fim?: string;                     // "HH:MM" (pode cruzar a meia-noite)
  considerarProrrogacao: boolean;   // Súmula 60/TST
  intervaloNoturnoMin: number;      // minutos de intervalo dentro do período noturno
  dias: number;                     // quantos dias no período
  tipo: TipoAtividade;              // urbano x rural
}

type Props = {
  cargo?: string;
  uf?: string;
  showShareButtons?: boolean;
  showAds?: boolean;
  /** Evita qualquer aviso interno de limite para centralizar o aviso na página. */
  suppressUsageUi?: boolean;
};

export default function AdicionalNoturnoCalculator({
  cargo,
  uf,
  showShareButtons = false,
  showAds = true,
  suppressUsageUi = true,
}: Props) {
  const { toast } = useToast();

  // Gate global (4 grátis no total, PRO ilimitado)
  const { isPro, remaining, allowOrRedirect, incrementCount } = useUsageLimit();
  const overLimit = !isPro && (remaining ?? 0) <= 0;

  const [modo, setModo] = useState<"horas" | "horario">("horas");

  const [inputs, setInputs] = useState<CalculationInputs>({
    salarioBase: undefined,
    jornada: 220,
    percentualAdicional: 20,
    horasNoturnas: undefined,
    inicio: "",
    fim: "",
    considerarProrrogacao: true,
    intervaloNoturnoMin: 0,
    dias: 1,
    tipo: "urbano",
  });

  const [result, setResult] = useState<{
    valorHora: number;
    percentualUsado: number;
    horasNoturnasComputadas: number; // já considerando redução 52m30s (urbano) ou 60m (rural)
    minutosNoturnosReais: number;
    adicionalTotal: number;
    salarioComAdicional: number;
    aplicouProrrogacao: boolean;
  } | null>(null);

  // ---------- helpers ----------
  const parseHHMM = (s: string): number | null => {
    if (!s) return null;
    const [hh, mm] = s.split(":").map((x) => Number(x));
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    return hh * 60 + mm; // minutos desde 00:00
  };

  // Retorna janelas noturnas (em minutos) no eixo "22:00 -> 29:00 (05:00 do dia seguinte)":
  // Para cruzar a meia-noite, estendemos o eixo até 35:59 (11:59 do dia seguinte) se necessário.
  const nightWindow = (tipo: TipoAtividade): { start: number; end: number } => {
    switch (tipo) {
      case "rural_lavoura":
        // 21:00 às 05:00
        return { start: 21 * 60, end: 29 * 60 }; // 1260 -> 1740
      case "rural_pecuaria":
        // 20:00 às 04:00
        return { start: 20 * 60, end: 28 * 60 }; // 1200 -> 1680
      default:
        // urbano: 22:00 às 05:00 (CLT art. 73)
        return { start: 22 * 60, end: 29 * 60 }; // 1320 -> 1740
    }
  };

  // Calcula minutos noturnos reais dentro do turno informado, com opção de prorrogação após fim da janela noturna
  const calcularMinutosNoturnos = (
    inicio: number,
    fim: number,
    tipo: TipoAtividade,
    considerarProrrogacao: boolean
  ): { minutos: number; aplicouProrrogacao: boolean } => {
    const { start, end } = nightWindow(tipo); // ex.: 1320 → 1740
    let s = inicio;
    let e = fim;
    if (e <= s) e += 24 * 60; // cruza meia-noite

    // janela noturna base (transformada para o mesmo eixo do período)
    const nightStart = start;
    const nightEnd = end;

    // normalizamos janelas adicionando +1440 se preciso para cobrir [s,e]
    const segments = [
      { ns: nightStart, ne: nightEnd },
      { ns: nightStart + 1440, ne: nightEnd + 1440 }, // caso o turno passe de 29:00
    ];

    let minutos = 0;
    for (const seg of segments) {
      const overlapStart = Math.max(s, seg.ns);
      const overlapEnd = Math.min(e, seg.ne);
      if (overlapEnd > overlapStart) {
        minutos += overlapEnd - overlapStart;
      }
    }

    let aplicouProrrogacao = false;

    // Prorrogação: se houve qualquer minuto noturno e o fim do turno ultrapassa o fim da janela noturna,
    // também incide adicional sobre o período prorrogado até o fim do turno (Súmula 60/TST).
    if (considerarProrrogacao && minutos > 0) {
      // achar "end" real mais próximo da janela noturna que foi usada
      const baseEnd = e >= segments[0].ne ? segments[0].ne : segments[1].ne;
      if (e > baseEnd) {
        minutos += e - baseEnd;
        aplicouProrrogacao = true;
      }
    }

    return { minutos, aplicouProrrogacao };
  };

  const calcValorHora = (salarioBase?: number, jornada?: number) => {
    if (!salarioBase || !jornada || jornada <= 0) return 0;
    return salarioBase / jornada;
  };

  const handleCalculate = async () => {
    // Gate: redireciona p/ /assinar-pro se passou do limite
    const ok = await allowOrRedirect();
    if (!ok) return;

    // validações base
    if (!inputs.salarioBase || inputs.salarioBase <= 0) {
      toast({ title: "Informe o salário base", description: "Preencha o salário base mensal para calcular." });
      return;
    }
    if (!inputs.jornada || inputs.jornada <= 0) {
      toast({ title: "Jornada inválida", description: "A jornada mensal deve ser maior que zero." });
      return;
    }
    if (!inputs.percentualAdicional || inputs.percentualAdicional < 0) {
      toast({ title: "Percentual inválido", description: "Defina o percentual do adicional (ex.: 20%)." });
      return;
    }
    if (!inputs.dias || inputs.dias <= 0) {
      toast({ title: "Dias no período", description: "Defina em quantos dias o cálculo deve incidir." });
      return;
    }

    // cálculo de horas noturnas
    let minutosNoturnosReais = 0;
    let aplicouProrrogacao = false;

    if (modo === "horario") {
      const ini = parseHHMM(inputs.inicio || "");
      const fim = parseHHMM(inputs.fim || "");
      if (ini == null || fim == null) {
        toast({ title: "Horários inválidos", description: "Preencha início e fim no formato HH:MM." });
        return;
      }
      const r = calcularMinutosNoturnos(ini, fim, inputs.tipo, inputs.considerarProrrogacao);
      minutosNoturnosReais = Math.max(0, r.minutos - (inputs.intervaloNoturnoMin || 0));
      aplicouProrrogacao = r.aplicouProrrogacao;
    } else {
      // modo por horas diretas
      if (!inputs.horasNoturnas || inputs.horasNoturnas <= 0) {
        toast({ title: "Horas noturnas", description: "Informe as horas noturnas (ou use o modo por horário)." });
        return;
      }
      // converte horas diretas em minutos reais
      minutosNoturnosReais = Math.round((inputs.horasNoturnas || 0) * 60);
    }

    // aplica regra da "hora noturna reduzida" apenas no urbano (52m30s); no rural permanece 60m
    const divisorMinutosHora = inputs.tipo === "urbano" ? 52.5 : 60;
    const horasNoturnasComputadas = (minutosNoturnosReais / divisorMinutosHora) * (inputs.dias || 1);

    const valorHora = calcValorHora(inputs.salarioBase, inputs.jornada);
    const adicionalHora = valorHora * (inputs.percentualAdicional / 100);
    const adicionalTotal = adicionalHora * horasNoturnasComputadas;
    const salarioComAdicional = (inputs.salarioBase || 0) + adicionalTotal;

    setResult({
      valorHora,
      percentualUsado: inputs.percentualAdicional,
      horasNoturnasComputadas,
      minutosNoturnosReais: minutosNoturnosReais * (inputs.dias || 1),
      adicionalTotal,
      salarioComAdicional,
      aplicouProrrogacao,
    });

    // Incrementa uso (apenas para não-PRO) — após cálculo bem-sucedido
    await incrementCount();

    // Telemetria opcional
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "calculate_adicional_noturno", {
        cargo: cargo || "unknown",
        uf: uf || "unknown",
        modo,
        tipo: inputs.tipo,
        prorrogacao: inputs.considerarProrrogacao,
      });
    }
  };

  const handleClear = () => {
    setInputs({
      salarioBase: undefined,
      jornada: 220,
      percentualAdicional: inputs.tipo === "urbano" ? 20 : 25,
      horasNoturnas: undefined,
      inicio: "",
      fim: "",
      considerarProrrogacao: true,
      intervaloNoturnoMin: 0,
      dias: 1,
      tipo: inputs.tipo,
    });
    setResult(null);
  };

  const handleShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copiado!", description: "O link foi copiado para a área de transferência." });
      if ((window as any).gtag) {
        (window as any).gtag("event", "copy_link", { cargo: cargo || "unknown", uf: uf || "unknown" });
      }
    }
  };

  const handleCopyEmbed = () => {
    const origin =
      import.meta.env.VITE_PUBLIC_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    const params = [cargo ? `cargo=${cargo}` : "", uf ? `uf=${uf}` : ""]
      .filter(Boolean)
      .join("&");
    const embedCode = `<iframe src="${origin}/widget/adicional-noturno${params ? "?" + params : ""}" width="100%" height="560" loading="lazy"></iframe>`;

    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(embedCode);
      toast({ title: "Código copiado!", description: "O código de incorporação foi copiado." });
      if ((window as any).gtag) {
        (window as any).gtag("event", "copy_embed", { cargo: cargo || "unknown", uf: uf || "unknown" });
      }
    }
  };

  const canCalculate =
    !!inputs.salarioBase &&
    !!inputs.jornada &&
    (modo === "horas"
      ? !!inputs.horasNoturnas && inputs.horasNoturnas > 0
      : !!inputs.inicio && !!inputs.fim) &&
    !overLimit;

  // Ajuste automático do % default por tipo de atividade
  const handleTipoChange = (tipo: TipoAtividade) => {
    setInputs((prev) => ({
      ...prev,
      tipo,
      percentualAdicional: tipo === "urbano" ? 20 : 25,
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Adicional Noturno — Cálculo Completo
          </CardTitle>
          <CardDescription>
            Preencha os dados para calcular o adicional noturno
            {cargo && uf && ` para ${cargo} em ${uf}`}.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tipo de atividade */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de atividade</Label>
              <select
                id="tipo"
                className="w-full border rounded-md h-10 px-3 bg-background"
                value={inputs.tipo}
                onChange={(e) => handleTipoChange(e.target.value as TipoAtividade)}
              >
                <option value="urbano">Urbano (22h–5h, 20%)</option>
                <option value="rural_lavoura">Rural — Lavoura (21h–5h, 25%)</option>
                <option value="rural_pecuaria">Rural — Pecuária (20h–4h, 25%)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salario">Salário Base Mensal</Label>
              <NumberInput
                id="salario"
                prefix="R$"
                decimal
                placeholder="0,00"
                value={inputs.salarioBase}
                onChange={(v) => setInputs((p) => ({ ...p, salarioBase: v }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jornada">Jornada Mensal</Label>
              <NumberInput
                id="jornada"
                suffix="h"
                value={inputs.jornada}
                onChange={(v) => setInputs((p) => ({ ...p, jornada: v || 220 }))}
              />
            </div>
          </div>

          {/* Percentual — pode ser sobrescrito por CCT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="percentual">Percentual do Adicional</Label>
              <NumberInput
                id="percentual"
                suffix="%"
                value={inputs.percentualAdicional}
                onChange={(v) => setInputs((p) => ({ ...p, percentualAdicional: v || (p.tipo === "urbano" ? 20 : 25) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dias">Dias no Período</Label>
              <NumberInput
                id="dias"
                value={inputs.dias}
                onChange={(v) => setInputs((p) => ({ ...p, dias: v || 1 }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Modo de cálculo</Label>
              <div className="flex gap-2">
                <Button
                  variant={modo === "horas" ? "default" : "outline"}
                  onClick={() => setModo("horas")}
                >
                  Horas diretas
                </Button>
                <Button
                  variant={modo === "horario" ? "default" : "outline"}
                  onClick={() => setModo("horario")}
                >
                  Por horário
                </Button>
              </div>
            </div>
          </div>

          {/* Entradas específicas por modo */}
          {modo === "horas" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horas">Horas Noturnas no Período</Label>
                <NumberInput
                  id="horas"
                  suffix="h"
                  placeholder="0"
                  value={inputs.horasNoturnas}
                  onChange={(v) => setInputs((p) => ({ ...p, horasNoturnas: v }))}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inicio">Início (HH:MM)</Label>
                <input
                  id="inicio"
                  type="time"
                  className="w-full border rounded-md h-10 px-3 bg-background"
                  value={inputs.inicio}
                  onChange={(e) => setInputs((p) => ({ ...p, inicio: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fim">Fim (HH:MM)</Label>
                <input
                  id="fim"
                  type="time"
                  className="w-full border rounded-md h-10 px-3 bg-background"
                  value={inputs.fim}
                  onChange={(e) => setInputs((p) => ({ ...p, fim: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="intervalo">Intervalo no período noturno (min)</Label>
                <NumberInput
                  id="intervalo"
                  value={inputs.intervaloNoturnoMin}
                  onChange={(v) => setInputs((p) => ({ ...p, intervaloNoturnoMin: v || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prorrogacao">Prorrogação após 5h?</Label>
                <select
                  id="prorrogacao"
                  className="w-full border rounded-md h-10 px-3 bg-background"
                  value={String(inputs.considerarProrrogacao)}
                  onChange={(e) => setInputs((p) => ({ ...p, considerarProrrogacao: e.target.value === "true" }))}
                >
                  <option value="true">Sim (Súmula 60/TST)</option>
                  <option value="false">Não</option>
                </select>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <Button onClick={handleCalculate} disabled={!canCalculate || overLimit} className="flex-1">
              <Calculator className="w-4 h-4" />
              {overLimit ? "Limite atingido" : "Calcular"}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <RotateCcw className="w-4 h-4" />
              Limpar
            </Button>
          </div>

          {showShareButtons && (
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleShareLink} className="flex-1">
                <Share2 className="w-4 h-4" />
                Compartilhar Link
              </Button>
              <Button variant="outline" onClick={handleCopyEmbed} className="flex-1">
                <Copy className="w-4 h-4" />
                Copiar Código de Incorporação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultado */}
      {result && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Resultado do Cálculo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Valor da Hora Normal</p>
                  <p className="font-semibold">R$ {result.valorHora.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Percent className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Percentual Aplicado</p>
                  <p className="font-semibold">{result.percentualUsado.toFixed(2)}%</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Horas Noturnas Computadas</p>
                  <p className="font-semibold">
                    {result.horasNoturnasComputadas.toFixed(2)} h
                    <span className="text-xs text-muted-foreground"> (minutos reais: {result.minutosNoturnosReais}m)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Adicional Total</p>
                  <p className="font-semibold text-primary">R$ {result.adicionalTotal.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-primary">Salário com Adicional</p>
                  <p className="font-bold text-lg text-primary">R$ {result.salarioComAdicional.toFixed(2)}</p>
                  {result.aplicouProrrogacao && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Inclui prorrogação após o fim do período noturno (Súmula 60/TST).
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Como é calculado / base legal */}
      <Card>
        <CardHeader>
          <CardTitle>Como é Calculado o Adicional Noturno?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">1</div>
              <div>
                <p className="font-medium">Calcular valor da hora normal</p>
                <p className="text-sm text-muted-foreground">Salário base ÷ Jornada mensal em horas.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">2</div>
              <div>
                <p className="font-medium">Aplicar o percentual do adicional</p>
                <p className="text-sm text-muted-foreground">Valor da hora × percentual (ex.: 20% urbano; 25% rural, salvo CCT).</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">3</div>
              <div>
                <p className="font-medium">Determinar as horas noturnas</p>
                <p className="text-sm text-muted-foreground">
                  Urbano: trabalho entre 22h e 5h com <strong>hora reduzida de 52m30s</strong>; Rural: lavoura (21h–5h) e pecuária (20h–4h), sem hora reduzida.
                  Se a jornada noturna for prorrogada após 5h, o adicional continua incidindo sobre as horas prorrogadas (Súmula 60/TST).
                </p>
              </div>
            </div>
          </div>

          <Notice variant="info">
            <strong>Base legal (resumo):</strong> CLT, art. 73 — adicional mínimo de 20% para o trabalho noturno urbano entre 22h e 5h, com hora reduzida de 52m30s; 
            no rural, regra geral de 25% e faixas horárias distintas (lavoura 21–5 / pecuária 20–4), podendo convenção coletiva ajustar percentuais. Súmula 60/TST:
            prorrogação após 5h também recebe adicional quando a jornada foi cumprida no período noturno.
          </Notice>
        </CardContent>
      </Card>
    </div>
  );
}
