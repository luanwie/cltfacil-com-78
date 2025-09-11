import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Briefcase, Calculator, TrendingUp, RotateCcw } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/currency";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useToast } from "@/hooks/use-toast";
import { PDFExportButton } from "@/components/ui/pdf-export-button";
import SaveCalcButton from "@/components/SaveCalcButton";
import { useCalculationReload } from "@/hooks/useCalculationReload";
import { Button } from "@/components/ui/button";
import { 
  MobileCalcLayout, 
  MobileInputGroup, 
  MobileResultCard, 
  MobileResultRow, 
  MobileButtonGroup 
} from "@/components/ui/mobile-calc-layout";

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

const CustoFuncionarioCalculator = () => {
  const { isPro, remaining, allowOrRedirect, incrementCount } = useUsageLimit();
  const { toast } = useToast();
  
  const [inputs, setInputs] = useState<EmployeeCostInputs>({
    salario: 0,
    valeTransporte: 0,
    valeRefeicao: 0,
    planoSaude: 0,
    outrosBeneficios: 0
  });

  const [result, setResult] = useState<EmployeeCostResult | null>(null);

  // Reload calculation data if coming from saved calculations
  useCalculationReload(setInputs, setResult);

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

  const handleCalculate = async () => {
    if (inputs.salario <= 0) {
      toast({
        title: "Erro no cálculo",
        description: "Informe um salário válido para calcular o custo total.",
        variant: "destructive",
      });
      return;
    }

    if (!(await allowOrRedirect())) return;

    const calculatedResult = calculateEmployeeCost(inputs);
    setResult(calculatedResult);
    await incrementCount();

    toast({
      title: "Cálculo realizado",
      description: "Custo total do funcionário calculado com sucesso!",
    });
  };

  const handleReset = () => {
    setInputs({
      salario: 0,
      valeTransporte: 0,
      valeRefeicao: 0,
      planoSaude: 0,
      outrosBeneficios: 0
    });
    setResult(null);
  };

  const handleInputChange = (field: keyof EmployeeCostInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MobileCalcLayout title="Custo Total do Funcionário" icon={<Briefcase className="w-6 h-6" />}>
      <MobileInputGroup>
        {/* Salário */}
        <div className="space-y-2">
          <Label htmlFor="salario">Salário Pretendido *</Label>
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
        <div className="space-y-2">
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
      </MobileInputGroup>

      <MobileButtonGroup>
        <Button onClick={handleCalculate} size="lg" className="flex-1">
          <Calculator className="w-4 h-4" />
          Calcular Custo Total
        </Button>
        <Button onClick={handleReset} variant="outline" size="lg">
          <RotateCcw className="w-4 h-4" />
          Limpar
        </Button>
      </MobileButtonGroup>

      {/* Resultado */}
      {result && (
        <MobileResultCard title="Resumo do Custo Total">
          <div className="space-y-4">
            <MobileResultRow label="Salário Base" value={formatBRL(result.salario)} />
            <MobileResultRow label="Benefícios Totais" value={formatBRL(result.beneficiosTotal)} />
            
            <div className="border-t pt-4 space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Encargos Obrigatórios:</h4>
              <MobileResultRow label="INSS Patronal (20%)" value={formatBRL(result.inssPatronal)} />
              <MobileResultRow label="FGTS (8%)" value={formatBRL(result.fgts)} />
              <MobileResultRow label="Férias + 1/3" value={formatBRL(result.feriasProporcionais)} />
              <MobileResultRow label="13º Salário" value={formatBRL(result.decimoTerceiro)} />
              <MobileResultRow label="Outros Encargos (5,8%)" value={formatBRL(result.outrosEncargos)} />
            </div>

            <div className="border-t pt-4">
              <MobileResultRow 
                label="Total de Encargos" 
                value={`${formatBRL(result.encargosTotal)} (${formatPercent(result.percentualEncargos / 100, 1)})`}
                highlight
              />
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

            <div className="text-xs text-muted-foreground space-y-1 mt-4">
              <p>• Encargos calculados sobre salário base</p>
              <p>• Inclui provisões de férias e 13º</p>
              <p>• Não inclui rescisão nem passivo trabalhista</p>
            </div>
          </div>
        </MobileResultCard>
      )}

      {result && (
        <MobileButtonGroup>
          <div className="flex-1">
            <PDFExportButton
              calculatorName="Custo Total do Funcionário"
              results={[
                { label: "Salário Base", value: formatBRL(result.salario) },
                { label: "Benefícios Totais", value: formatBRL(result.beneficiosTotal) },
                { label: "INSS Patronal (20%)", value: formatBRL(result.inssPatronal) },
                { label: "FGTS (8%)", value: formatBRL(result.fgts) },
                { label: "Férias + 1/3", value: formatBRL(result.feriasProporcionais) },
                { label: "13º Salário", value: formatBRL(result.decimoTerceiro) },
                { label: "Outros Encargos", value: formatBRL(result.outrosEncargos) },
                { label: "Total de Encargos", value: formatBRL(result.encargosTotal) },
                { label: "CUSTO TOTAL MENSAL", value: formatBRL(result.custoTotal) },
              ]}
            />
          </div>
          <SaveCalcButton
            calculator="Custo Total do Funcionário"
            calculationType="custo-funcionario"
            input={inputs}
            result={result}
          />
        </MobileButtonGroup>
      )}
    </MobileCalcLayout>
  );
};

export default CustoFuncionarioCalculator;