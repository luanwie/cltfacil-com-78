import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookmarkPlus } from "lucide-react";
import { saveCalc } from "@/integrations/supabase/user-data";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  calculator: string;       // ex: "adicional_noturno"
  input: unknown;           // dados de entrada do cálculo
  result: unknown;          // resultado do cálculo
  note?: string;            // observação opcional
  disabled?: boolean;
};

export default function SaveCalcButton({ calculator, input, result, note, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        // redireciona p/ login mantendo o retorno
        navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
        return;
      }

      const saved = await saveCalc();
      // Note: saveCalc is currently a placeholder - this will be implemented when saved_calcs table is created
      toast.info("Recurso de salvar cálculos será implementado em breve.");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar cálculo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSave} disabled={disabled || loading} variant="outline">
      <BookmarkPlus className="w-4 h-4 mr-2" />
      {loading ? "Salvando..." : "Salvar cálculo"}
    </Button>
  );
}
