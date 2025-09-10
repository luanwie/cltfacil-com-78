import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { usePDFExport } from "@/hooks/usePDFExport";
import { useToast } from "@/hooks/use-toast";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import { useNavigate } from "react-router-dom";

interface PDFExportButtonProps {
  calculatorName: string;
  results: Array<{
    label: string;
    value: string;
  }>;
  disabled?: boolean;
}

export const PDFExportButton = ({ calculatorName, results, disabled }: PDFExportButtonProps) => {
  const { exportToPDF } = usePDFExport();
  const { toast } = useToast();
  const { isPro } = useProAndUsage();
  const navigate = useNavigate();

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
    <Button
      onClick={handleExport}
      disabled={disabled || results.length === 0}
      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground w-full sm:w-auto"
      size="lg"
    >
      <Download className="w-4 h-4 mr-2" />
      Exportar PDF
    </Button>
  );
};