import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFExportData {
  calculatorName: string;
  results: Array<{
    label: string;
    value: string;
  }>;
  logoUrl?: string;
  companyName?: string;
}

export const usePDFExport = () => {
  const exportToPDF = async (data: PDFExportData) => {
    try {
      const pdf = new jsPDF();
      
      let yPosition = 20;
      
      // === CABEÇALHO COM LOGO ===
      if (data.logoUrl) {
        try {
          // Carregar e redimensionar logo
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            logoImg.onload = resolve;
            logoImg.onerror = reject;
            logoImg.src = data.logoUrl;
          });
          
          const logoWidth = 30;
          const logoHeight = 20;
          pdf.addImage(logoImg, 'PNG', 20, yPosition, logoWidth, logoHeight);
          
          // Título da empresa ao lado da logo
          if (data.companyName) {
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(44, 62, 80); // Azul escuro profissional
            pdf.text(data.companyName, 55, yPosition + 8);
          }
          
          yPosition += 35;
        } catch (error) {
          console.warn('Erro ao carregar logo:', error);
          yPosition += 10;
        }
      }
      
      // === TÍTULO PRINCIPAL ===
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(220, 38, 38); // Vermelho CLTFácil
      pdf.text('CLTFácil.com', 20, yPosition);
      
      // Subtítulo
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(44, 62, 80);
      pdf.text('Relatório de Cálculo Trabalhista', 20, yPosition + 12);
      
      yPosition += 30;
      
      // === INFORMAÇÕES DO RELATÓRIO ===
      // Caixa destacada para título da calculadora
      pdf.setFillColor(248, 250, 252); // Cinza muito claro
      pdf.setDrawColor(226, 232, 240); // Borda cinza
      pdf.rect(20, yPosition - 5, 170, 20, 'FD');
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42); // Quase preto
      pdf.text(data.calculatorName, 25, yPosition + 8);
      
      yPosition += 25;
      
      // Data e hora de geração
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139); // Cinza médio
      const currentDate = new Date();
      const dateStr = currentDate.toLocaleDateString('pt-BR');
      const timeStr = currentDate.toLocaleTimeString('pt-BR');
      pdf.text(`Gerado em: ${dateStr} às ${timeStr}`, 20, yPosition);
      
      yPosition += 20;
      
      // === LINHA SEPARADORA ELEGANTE ===
      pdf.setDrawColor(220, 38, 38);
      pdf.setLineWidth(0.8);
      pdf.line(20, yPosition, 190, yPosition);
      
      yPosition += 15;
      
      // === SEÇÃO DE RESULTADOS ===
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('Resultados do Cálculo', 20, yPosition);
      
      yPosition += 10;
      
      // === TABELA DE RESULTADOS COM DESIGN PROFISSIONAL ===
      data.results.forEach((result, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }
        
        // Alternar cores das linhas para melhor legibilidade
        const isEven = index % 2 === 0;
        if (isEven) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(20, yPosition - 3, 170, 12, 'F');
        }
        
        // Verificar se é um valor importante (contém R$ ou %)
        const isImportantValue = result.value.includes('R$') || result.value.includes('%');
        
        if (isImportantValue) {
          // Caixa destacada para valores importantes
          pdf.setFillColor(254, 242, 242); // Vermelho muito claro
          pdf.setDrawColor(252, 165, 165); // Borda vermelha clara
          pdf.rect(20, yPosition - 3, 170, 12, 'FD');
        }
        
        // Label
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(71, 85, 105);
        pdf.text(result.label, 25, yPosition + 4);
        
        // Value
        pdf.setFont('helvetica', isImportantValue ? 'bold' : 'normal');
        if (isImportantValue) {
          pdf.setTextColor(220, 38, 38);
        } else {
          pdf.setTextColor(15, 23, 42);
        }
        pdf.text(result.value, 185, yPosition + 4, { align: 'right' });
        
        yPosition += 12;
      });
      
      // === RODAPÉ COM DISCLAIMER ===
      yPosition += 20;
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 30;
      }
      
      // Caixa de disclaimer
      pdf.setFillColor(255, 251, 235); // Amarelo muito claro
      pdf.setDrawColor(245, 158, 11); // Borda amarela
      pdf.rect(20, yPosition - 5, 170, 25, 'FD');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(146, 64, 14); // Marrom alaranjado
      pdf.text('⚠️ AVISO IMPORTANTE', 25, yPosition + 3);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(92, 57, 19);
      const disclaimer1 = 'Este cálculo é uma estimativa baseada nas informações fornecidas.';
      const disclaimer2 = 'Para análises específicas, consulte um contador ou advogado trabalhista.';
      pdf.text(disclaimer1, 25, yPosition + 10);
      pdf.text(disclaimer2, 25, yPosition + 16);
      
      // === RODAPÉ FINAL ===
      yPosition += 35;
      pdf.setFontSize(9);
      pdf.setTextColor(148, 163, 184);
      pdf.text('Gerado por CLTFácil.com - Calculadoras Trabalhistas', 105, yPosition, { align: 'center' });
      
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