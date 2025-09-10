import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { usePDFExport } from "@/hooks/usePDFExport";
import { useToast } from "@/hooks/use-toast";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogoUpload } from "@/components/ui/logo-upload";
import { SaveCalcButton } from "@/components/ui/save-calc-button";

interface PDFExportButtonProps {
  calculatorName: string;
  results: Array<{
    label: string;
    value: string;
  }>;
  disabled?: boolean;
  // Props para salvar cálculo
  calculator?: string;
  calculationType?: string;
  input?: unknown;
  resultData?: unknown;
}

export const PDFExportButton = ({ 
  calculatorName, 
  results, 
  disabled,
  calculator,
  calculationType, 
  input,
  resultData
}: PDFExportButtonProps) => {
  const { exportToPDF } = usePDFExport();
  const { toast } = useToast();
  const { isPro } = useProAndUsage();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('logo_url, nome')
          .eq('user_id', user.id)
          .single();
        
        if (data && !error) {
          setLogoUrl(data.logo_url || '');
          setCompanyName(data.nome || '');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };

    loadUserData();
  }, [user]);

  const handleExport = async () => {
    if (!isPro) {
      toast({
        title: "Torne-se PRO para exportar PDF",
        description: "A exportação de PDF é uma funcionalidade exclusiva para usuários PRO.",
        variant: "destructive",
      });
      navigate("/assinar-pro");
      return;
    }

    if (results.length === 0) {
      toast({
        title: "Nenhum resultado para exportar",
        description: "Execute o cálculo primeiro para poder exportar o PDF.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Gerando PDF...",
      description: "Por favor, aguarde enquanto preparamos seu relatório.",
    });

    const success = await exportToPDF({
      calculatorName,
      results,
      logoUrl: logoUrl || undefined,
      companyName: companyName || undefined,
    });

    if (success) {
      toast({
        title: "PDF exportado com sucesso!",
        description: "O arquivo foi salvo em sua pasta de downloads.",
      });
    } else {
      toast({
        title: "Erro ao exportar PDF",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start">
      {isPro && (
        <LogoUpload 
          onLogoUploaded={setLogoUrl}
          currentLogoUrl={logoUrl}
        />
      )}
      
      {calculator && calculationType && input && resultData && (
        <SaveCalcButton
          calculator={calculator}
          calculationType={calculationType}
          input={input}
          result={resultData}
          disabled={disabled}
        />
      )}
      
      <Button
        onClick={handleExport}
        disabled={disabled || results.length === 0}
        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground w-full sm:w-auto"
        size="lg"
      >
        <Download className="w-4 h-4 mr-2" />
        Exportar PDF
      </Button>
    </div>
  );
};