import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Briefcase, Calculator, TrendingUp, Users } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/currency";

interface EmployeeCostInputs {
  salario: number;
  valeTransporte: number;
  valeRefeicao: number;
  planoSaude: number;
  outrosBeneficios: number;
}

interface EmployeeCostResult {
  salario: number;
  beneficiosTotal: number;
  inssPatronal: number;
  fgts: number;
  feriasProporcionais: number;
  decimoTerceiro: number;
  outrosEncargos: number;
  encargosTotal: number;
  custoTotal: number;
  percentualEncargos: number;
}

const EmployeeCostCalculator = () => {
  const [inputs, setInputs] = useState<EmployeeCostInputs>({
    salario: 0,
    valeTransporte: 0,
    valeRefeicao: 0,
    planoSaude: 0,
    outrosBeneficios: 0
  });

  const [result, setResult] = useState<EmployeeCostResult | null>(null);

  const calculateEmployeeCost = (inputs: EmployeeCostInputs): EmployeeCostResult => {
    const { salario, valeTransporte, valeRefeicao, planoSaude, outrosBeneficios } = inputs;

    // Benefícios totais
    const beneficiosTotal = valeTransporte + valeRefeicao + planoSaude + outrosBeneficios;

    // Encargos obrigatórios
    const inssPatronal = salario * 0.20; // 20% INSS patronal
    const fgts = salario * 0.08; // 8% FGTS
    const feriasProporcionais = salario * (1 + 1/3) / 12; // Férias + 1/3 proporcionais
    const decimoTerceiro = salario / 12; // 13º proporcional
    
    // Outros encargos (SAT + Salário Educação + Sistema S - aproximação)
    const outrosEncargos = salario * 0.058; // ~5,8% (SAT 2% + Sal. Educ. 2,5% + Sistema S 1,3%)

    const encargosTotal = inssPatronal + fgts + feriasProporcionais + decimoTerceiro + outrosEncargos;
    const custoTotal = salario + beneficiosTotal + encargosTotal;
    const percentualEncargos = salario > 0 ? (encargosTotal / salario) * 100 : 0;

    return {
      salario,
      beneficiosTotal,
      inssPatronal,
      fgts,
      feriasProporcionais,
      decimoTerceiro,
      outrosEncargos,
      encargosTotal,
      custoTotal,
      percentualEncargos
    };
  };

  useEffect(() => {
    if (inputs.salario > 0) {
      setResult(calculateEmployeeCost(inputs));
    } else {
      setResult(null);
    }
  }, [inputs]);

  const handleInputChange = (field: keyof EmployeeCostInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
      
      <div className="relative">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">💼 Calculadora Exclusiva: Custo Real do Funcionário</CardTitle>
          <CardDescription className="text-lg">
            Para empresários calcularem o custo total de contratar
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Salário */}
            <div className="space-y-2">
              <Label htmlFor="salario">Salário Pretendido</Label>
              <NumberInput
                id="salario"
                value={inputs.salario}
                onChange={(value) => handleInputChange('salario', value)}
                placeholder="Ex: 3.500,00"
                prefix="R$"
                className="min-h-12"
              />
            </div>

            {/* Vale Transporte */}
            <div className="space-y-2">
              <Label htmlFor="valeTransporte">Vale Transporte</Label>
              <NumberInput
                id="valeTransporte"
                value={inputs.valeTransporte}
                onChange={(value) => handleInputChange('valeTransporte', value)}
                placeholder="Ex: 200,00"
                prefix="R$"
                className="min-h-12"
              />
            </div>

            {/* Vale Refeição */}
            <div className="space-y-2">
              <Label htmlFor="valeRefeicao">Vale Refeição/Alimentação</Label>
              <NumberInput
                id="valeRefeicao"
                value={inputs.valeRefeicao}
                onChange={(value) => handleInputChange('valeRefeicao', value)}
                placeholder="Ex: 400,00"
                prefix="R$"
                className="min-h-12"
              />
            </div>

            {/* Plano de Saúde */}
            <div className="space-y-2">
              <Label htmlFor="planoSaude">Plano de Saúde</Label>
              <NumberInput
                id="planoSaude"
                value={inputs.planoSaude}
                onChange={(value) => handleInputChange('planoSaude', value)}
                placeholder="Ex: 300,00"
                prefix="R$"
                className="min-h-12"
              />
            </div>

            {/* Outros Benefícios */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="outrosBeneficios">Outros Benefícios</Label>
              <NumberInput
                id="outrosBeneficios"
                value={inputs.outrosBeneficios}
                onChange={(value) => handleInputChange('outrosBeneficios', value)}
                placeholder="Ex: seguro de vida, auxílio creche..."
                prefix="R$"
                className="min-h-12"
              />
            </div>
          </div>

          {/* Resultado */}
          {result && (
            <div className="mt-8 p-6 bg-card rounded-lg border border-border/50 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Custo Total Mensal</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Salário Base:</span>
                    <span className="font-semibold">{formatBRL(result.salario)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Benefícios:</span>
                    <span className="font-semibold">{formatBRL(result.beneficiosTotal)}</span>
                  </div>

                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>INSS Patronal (20%):</span>
                      <span>{formatBRL(result.inssPatronal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>FGTS (8%):</span>
                      <span>{formatBRL(result.fgts)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Férias + 1/3:</span>
                      <span>{formatBRL(result.feriasProporcionais)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>13º Salário:</span>
                      <span>{formatBRL(result.decimoTerceiro)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Outros Encargos:</span>
                      <span>{formatBRL(result.outrosEncargos)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Encargos Obrigatórios:</span>
                    <span className="font-semibold text-orange-600">
                      {formatBRL(result.encargosTotal)} ({formatPercent(result.percentualEncargos / 100, 1)})
                    </span>
                  </div>

                  {/* Custo Total Destacado */}
                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <span className="font-bold text-lg">CUSTO TOTAL MENSAL:</span>
                      </div>
                      <span className="font-bold text-2xl text-primary">
                        {formatBRL(result.custoTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Encargos calculados sobre salário base</p>
                    <p>• Inclui provisões de férias e 13º</p>
                    <p>• Não inclui rescisão nem passivo trabalhista</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default EmployeeCostCalculator;