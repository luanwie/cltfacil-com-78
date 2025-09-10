import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

interface ReloadData {
  input: any;
  result: any;
  calculationName: string;
}

interface LocationState {
  reloadData?: ReloadData;
}

export const useCalculationReload = (setInputs: (inputs: any) => void, setResult?: (result: any) => void) => {
  const location = useLocation();
  
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.reloadData) {
      const { input, result, calculationName } = state.reloadData;
      
      // Recarregar inputs
      if (input && setInputs) {
        setInputs(input);
      }
      
      // Recarregar resultado se fornecido
      if (result && setResult) {
        setResult(result);
      }
      
      toast.success(`Cálculo "${calculationName}" recarregado com sucesso!`);
      
      // Limpar o state para evitar recarregamentos desnecessários
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location, setInputs, setResult]);
};