import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { usePDFExport } from "@/hooks/usePDFExport";
import { useToast } from "@/hooks/use-toast";

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

  const handleExport = async () => {
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