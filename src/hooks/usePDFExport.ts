import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFExportData {
  calculatorName: string;
  results: Array<{
    label: string;
    value: string;
  }>;
}

export const usePDFExport = () => {
  const exportToPDF = async (data: PDFExportData) => {
    try {
      const pdf = new jsPDF();
      
      // Logo/título no topo
      pdf.setFontSize(20);
      pdf.setTextColor(220, 38, 38); // Red color
      pdf.text('CLTFácil.com', 20, 20);
      
      // Título da calculadora
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(data.calculatorName, 20, 35);
      
      // Data de geração
      pdf.setFontSize(12);
      const currentDate = new Date().toLocaleDateString('pt-BR');
      pdf.text(`Data de geração: ${currentDate}`, 20, 45);
      
      // Linha separadora
      pdf.line(20, 50, 190, 50);
      
      // Resultados em tabela
      let yPosition = 60;
      pdf.setFontSize(14);
      pdf.text('Resultados do Cálculo:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      data.results.forEach((result, index) => {
        if (yPosition > 250) { // Nova página se necessário
          pdf.addPage();
          yPosition = 20;
        }
        
        // Label
        pdf.setTextColor(68, 68, 68);
        pdf.text(result.label, 20, yPosition);
        
        // Value (aligned to the right)
        pdf.setTextColor(0, 0, 0);
        pdf.text(result.value, 190, yPosition, { align: 'right' });
        
        yPosition += 8;
      });
      
      // Disclaimer no final
      yPosition += 20;
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      const disclaimer = 'Este cálculo é uma estimativa. Consulte contador ou advogado.';
      pdf.text(disclaimer, 20, yPosition);
      
      // Nome do arquivo
      const fileName = `${data.calculatorName.toLowerCase().replace(/\s+/g, '-')}-calculo-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Download do PDF
      pdf.save(fileName);
      
      return true;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return false;
    }
  };

  return { exportToPDF };
};