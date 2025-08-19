import { useState } from "react";
import { Calculator, RotateCcw, Clock, DollarSign, Percent, Calendar, Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import Notice from "@/components/ui/notice";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import UsageBanner from "@/components/UsageBanner";
import { goPro } from "@/utils/proRedirect";
import { ensureCanCalculate } from "@/utils/usageGuard";
import { incrementCalcIfNeeded } from "@/utils/incrementCalc";

interface CalculationInputs {
  salarioBase: number | undefined;
  horasNoturnas: number | undefined;
  percentualAdicional: number;
  jornada: number;
}

interface AdicionalNoturnoCalculatorProps {
  cargo?: string;
  uf?: string;
  showShareButtons?: boolean;
  showAds?: boolean;
}

const AdicionalNoturnoCalculator = ({ 
  cargo, 
  uf, 
  showShareButtons = false,
  showAds = true 
}: AdicionalNoturnoCalculatorProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();
  const { isPro, isLogged, remaining, canUse } = ctx;
  
  const [inputs, setInputs] = useState<CalculationInputs>({
    salarioBase: undefined,
    horasNoturnas: undefined,
    percentualAdicional: 20, // Padrão CLT
    jornada: 220 // Horas mensais padrão
  });

  const [result, setResult] = useState<{
    valorHora: number;
    valorHoraNoturna: number;
    adicionalTotal: number;
    salarioComAdicional: number;
  } | null>(null);

  const handleCalculate = async () => {
    if (!inputs.salarioBase || !inputs.horasNoturnas) {
      return;
    }

    const ok = await ensureCanCalculate({ 
      ...ctx, 
      navigate, 
      currentPath: location.pathname, 
      focusUsage: () => document.getElementById('usage-banner')?.scrollIntoView({behavior:'smooth'}) 
    });
    if (!ok) return;

    // Cálculo fictício para demonstração (TODO: implementar regra real)
    const valorHora = inputs.salarioBase / inputs.jornada;
    const adicionalHora = (valorHora * inputs.percentualAdicional) / 100;
    const valorHoraNoturna = valorHora + adicionalHora;
    const adicionalTotal = adicionalHora * inputs.horasNoturnas;
    const salarioComAdicional = inputs.salarioBase + adicionalTotal;

    setResult({
      valorHora,
      valorHoraNoturna,
      adicionalTotal,
      salarioComAdicional
    });

    // Increment usage count for non-PRO users
    await incrementCalcIfNeeded(isPro);

    // Telemetria opcional
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'calculate_adicional_noturno', {
        cargo: cargo || 'unknown',
        uf: uf || 'unknown'
      });
    }
  };

  const handleClear = () => {
    setInputs({
      salarioBase: undefined,
      horasNoturnas: undefined,
      percentualAdicional: 20,
      jornada: 220
    });
    setResult(null);
  };

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });

      // Telemetria
      if (window.gtag) {
        window.gtag('event', 'copy_link', {
          cargo: cargo || 'unknown',
          uf: uf || 'unknown'
        });
      }
    }
  };

  const handleCopyEmbed = () => {
    const origin = import.meta.env.VITE_PUBLIC_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const cargoParam = cargo ? `cargo=${cargo}` : '';
    const ufParam = uf ? `uf=${uf}` : '';
    const params = [cargoParam, ufParam].filter(Boolean).join('&');
    const embedCode = `<iframe src="${origin}/widget/adicional-noturno${params ? '?' + params : ''}" width="100%" height="560" loading="lazy"></iframe>`;
    
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(embedCode);
      toast({
        title: "Código copiado!",
        description: "O código de incorporação foi copiado para a área de transferência.",
      });

      // Telemetria
      if (window.gtag) {
        window.gtag('event', 'copy_embed', {
          cargo: cargo || 'unknown',
          uf: uf || 'unknown'
        });
      }
    }
  };

  const canCalculate = inputs.salarioBase && inputs.horasNoturnas;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Dados para Cálculo
          </CardTitle>
          <CardDescription>
            Preencha as informações abaixo para calcular o adicional noturno
            {cargo && uf && ` para ${cargo} em ${uf}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salario">Salário Base Mensal</Label>
              <NumberInput
                id="salario"
                prefix="R$"
                decimal
                placeholder="0,00"
                value={inputs.salarioBase}
                onChange={(value) => setInputs(prev => ({ ...prev, salarioBase: value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horas">Horas Noturnas no Período</Label>
              <NumberInput
                id="horas"
                suffix="h"
                placeholder="0"
                value={inputs.horasNoturnas}
                onChange={(value) => setInputs(prev => ({ ...prev, horasNoturnas: value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentual">Percentual do Adicional</Label>
              <NumberInput
                id="percentual"
                suffix="%"
                value={inputs.percentualAdicional}
                onChange={(value) => setInputs(prev => ({ ...prev, percentualAdicional: value || 20 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jornada">Jornada Mensal</Label>
              <NumberInput
                id="jornada"
                suffix="h"
                value={inputs.jornada}
                onChange={(value) => setInputs(prev => ({ ...prev, jornada: value || 220 }))}
              />
            </div>
          </div>

          <UsageBanner 
            remaining={remaining} 
            isPro={isPro} 
            isLogged={isLogged} 
            onGoPro={() => goPro(navigate, isLogged, location.pathname)} 
          />

          <div className="flex gap-3">
            <Button 
              onClick={handleCalculate}
              disabled={!canCalculate || !canUse}
              className="flex-1"
            >
              <Calculator className="w-4 h-4" />
              {!canUse ? 'Limite atingido' : 'Calcular'}
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
                  <p className="text-sm text-muted-foreground">Valor da Hora Noturna</p>
                  <p className="font-semibold">R$ {result.valorHoraNoturna.toFixed(2)}</p>
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Como é calculado */}
      <Card>
        <CardHeader>
          <CardTitle>Como é Calculado o Adicional Noturno?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">
                1
              </div>
              <div>
                <p className="font-medium">Calcular valor da hora normal</p>
                <p className="text-sm text-muted-foreground">Salário base ÷ Jornada mensal em horas</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">
                2
              </div>
              <div>
                <p className="font-medium">Aplicar o adicional de 20%</p>
                <p className="text-sm text-muted-foreground">Valor da hora × 20% = Adicional por hora</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-1">
                3
              </div>
              <div>
                <p className="font-medium">Multiplicar pelas horas noturnas</p>
                <p className="text-sm text-muted-foreground">Adicional por hora × Quantidade de horas noturnas</p>
              </div>
            </div>
          </div>

          <Notice variant="info">
            <strong>Importante:</strong> A hora noturna urbana tem duração de 52 minutos e 30 segundos, 
            o que significa que 8 horas noturnas equivalem a aproximadamente 9 horas e 9 minutos.
          </Notice>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdicionalNoturnoCalculator;