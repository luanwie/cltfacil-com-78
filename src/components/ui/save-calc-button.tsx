import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookmarkPlus } from "lucide-react";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import SaveCalcModal from "@/components/SaveCalcModal";

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
  const [showModal, setShowModal] = useState(false);

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

    setShowModal(true);
  };

  return (
    <>
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

      {showModal && isPro && (
        <SaveCalcModal
          calculator={calculator}
          calculationType={calculationType}
          input={input}
          result={result}
          disabled={disabled}
        />
      )}
    </>
  );
};