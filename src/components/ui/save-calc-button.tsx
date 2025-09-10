import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookmarkPlus } from "lucide-react";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SaveCalcButtonProps {
  calculator: string;
  calculationType: string;
  input: unknown;
  result: unknown;
  disabled?: boolean;
}

export const SaveCalcButton = ({ 
  calculator, 
  calculationType, 
  input, 
  result, 
  disabled 
}: SaveCalcButtonProps) => {
  const { isPro } = useProAndUsage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [calculationName, setCalculationName] = useState("");

  const handleSaveClick = () => {
    if (!isPro) {
      toast.error("Torne-se PRO para salvar cálculos", {
        description: "O salvamento de cálculos é uma funcionalidade exclusiva para usuários PRO.",
        action: {
          label: "Tornar PRO",
          onClick: () => navigate("/assinar-pro"),
        },
      });
      return;
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!email.trim() || !employeeName.trim() || !calculationName.trim()) {
      toast.error("Todos os campos são obrigatórios");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado para salvar cálculos");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('calculation_history')
        .insert({
          user_email: user.email!,
          calculation_name: calculationName.trim(),
          calculation_type: calculationType,
          input_data: input as any,
          result_data: result as any
        } as any);

      if (error) {
        console.error('Erro ao salvar cálculo:', error);
        toast.error("Erro ao salvar cálculo");
        return;
      }

      toast.success("Cálculo salvo com sucesso!");
      
      // Reset form and close modal
      setEmail("");
      setEmployeeName("");
      setCalculationName("");
      setOpen(false);
    } catch (error) {
      console.error('Erro ao salvar cálculo:', error);
      toast.error("Erro ao salvar cálculo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={handleSaveClick}
          disabled={disabled}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
        >
          <BookmarkPlus className="w-4 h-4 mr-2" />
          Salvar Cálculo
        </Button>
      </DialogTrigger>
      
      {isPro && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Salvar Cálculo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeeName">Nome do Funcionário/Empresa *</Label>
              <Input
                id="employeeName"
                placeholder="Ex: João Silva ou Empresa XYZ"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="calculationName">Nome para identificar o cálculo *</Label>
              <Input
                id="calculationName"
                placeholder="Ex: Rescisão Janeiro 2025"
                value={calculationName}
                onChange={(e) => setCalculationName(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};