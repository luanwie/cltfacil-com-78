import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSEO } from "@/hooks/useSEO";

type CalculationHistory = {
  id: string;
  calculation_name: string;
  calculation_type: string;
  input_data: any;
  result_data: any;
  created_at: string;
  user_email: string;
};

const calculationTypeNames: Record<string, string> = {
  'rescisao': 'Rescisão',
  'ferias_proporcionais': 'Férias Proporcionais',
  'ferias_dobro': 'Férias em Dobro',
  'ferias_abono': 'Férias + Abono',
  'decimo_terceiro': '13º Salário',
  'adicional_noturno': 'Adicional Noturno',
  'aviso_previo': 'Aviso Prévio',
  'banco_horas': 'Banco de Horas',
  'dsr': 'DSR',
  'dsr_comissoes': 'DSR Comissões',
  'fgts': 'FGTS',
  'horas_extras': 'Horas Extras',
  'inss': 'INSS',
  'irrf': 'IRRF',
  'insalubridade': 'Insalubridade',
  'periculosidade': 'Periculosidade',
  'salario_liquido': 'Salário Líquido',
  'vale_transporte': 'Vale Transporte'
};

const calculationRoutes: Record<string, string> = {
  'rescisao': '/clt/rescisao',
  'ferias_proporcionais': '/clt/ferias-proporcionais',
  'ferias_dobro': '/clt/ferias-dobro',
  'ferias_abono': '/clt/ferias-abono',
  'decimo_terceiro': '/clt/decimo-terceiro',
  'adicional_noturno': '/clt/adicional-noturno',
  'aviso_previo': '/clt/aviso-previo',
  'banco_horas': '/clt/banco-de-horas',
  'dsr': '/clt/dsr',
  'dsr_comissoes': '/clt/dsr-comissoes',
  'fgts': '/clt/fgts',
  'horas_extras': '/clt/horas-extras',
  'inss': '/clt/inss',
  'irrf': '/clt/irrf',
  'insalubridade': '/clt/insalubridade',
  'periculosidade': '/clt/periculosidade',
  'salario_liquido': '/clt/salario-liquido',
  'vale_transporte': '/clt/vale-transporte'
};

export default function CalculosSalvos() {
  const [calculations, setCalculations] = useState<CalculationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useSEO({
    title: "Meus Cálculos Salvos - CLTFácil",
    description: "Acesse seus cálculos trabalhistas salvos. Recarregue, edite ou exclua seus cálculos salvos.",
    canonical: "/calculos-salvos",
  });

  useEffect(() => {
    if (user) {
      fetchCalculations();
    }
  }, [user]);

  const fetchCalculations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('calculation_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCalculations(data || []);
    } catch (error) {
      console.error('Erro ao buscar cálculos:', error);
      toast.error("Erro ao carregar cálculos salvos.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCalculation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calculation_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCalculations(prev => prev.filter(calc => calc.id !== id));
      toast.success("Cálculo excluído com sucesso!");
    } catch (error) {
      console.error('Erro ao excluir cálculo:', error);
      toast.error("Erro ao excluir cálculo.");
    }
  };

  const reloadCalculation = (calculation: CalculationHistory) => {
    const route = calculationRoutes[calculation.calculation_type];
    if (route) {
      // Passar os dados via state para a calculadora recarregar
      navigate(route, { 
        state: { 
          reloadData: {
            input: calculation.input_data,
            result: calculation.result_data,
            calculationName: calculation.calculation_name
          }
        }
      });
    } else {
      toast.error("Calculadora não encontrada.");
    }
  };

  if (loading) {
    return (
      <Container className="py-8">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  return (
    <ProtectedRoute>
      <Container className="py-8 space-y-8">
        <PageHeader
          title="Meus Cálculos Salvos"
          description="Gerencie seus cálculos trabalhistas salvos. Recarregue para recalcular ou exclua quando não precisar mais."
        />

        {calculations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum cálculo salvo</h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não salvou nenhum cálculo. Use o botão "Salvar cálculo" em qualquer calculadora.
              </p>
              <Button onClick={() => navigate('/calculadoras')}>
                Ver Calculadoras
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {calculations.map((calculation) => (
              <Card key={calculation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {calculation.calculation_name}
                    </CardTitle>
                    <Badge variant="secondary">
                      {calculationTypeNames[calculation.calculation_type] || calculation.calculation_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Salvo em {format(new Date(calculation.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => reloadCalculation(calculation)}
                        className="flex-1"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Recarregar Cálculo
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o cálculo "{calculation.calculation_name}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteCalculation(calculation.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </ProtectedRoute>
  );
}