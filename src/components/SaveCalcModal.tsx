import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookmarkPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

type Props = {
  calculator: string;
  calculationType: string;
  input: unknown;
  result: unknown;
  disabled?: boolean;
};

export default function SaveCalcModal({ calculator, calculationType, input, result, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [calcName, setCalculationName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSave = async () => {
    if (!email || !employeeName || !calcName) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        setOpen(false);
        navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
        return;
      }

      const { error } = await supabase
        .from('calculation_history')
        .insert([{
          user_email: email,
          calculation_name: `${employeeName} - ${calcName}`,
          calculation_type: calculationType,
          input_data: input as any,
          result_data: result as any
        }]);

      if (error) throw error;

      toast.success("Cálculo salvo com sucesso!");
      setOpen(false);
      setEmail("");
      setEmployeeName("");
      setCalculationName("");
    } catch (error) {
      console.error('Erro ao salvar cálculo:', error);
      toast.error("Erro ao salvar cálculo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} variant="outline">
          <BookmarkPlus className="w-4 h-4 mr-2" />
          Salvar cálculo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Salvar Cálculo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="employeeName">Nome do Funcionário/Empresa *</Label>
            <Input
              id="employeeName"
              placeholder="Ex: João Silva ou Empresa XYZ"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="calcName">Nome para identificar o cálculo *</Label>
            <Input
              id="calcName"
              placeholder="Ex: Rescisão Janeiro 2025"
              value={calcName}
              onChange={(e) => setCalculationName(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2 pt-4">
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
    </Dialog>
  );
}