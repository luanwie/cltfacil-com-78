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
      
      let yPosition = 25;
      
      // === CABEÇALHO CORPORATIVO COM LOGO ===
      // Fundo azul no cabeçalho
      pdf.setFillColor(15, 23, 42); // Azul escuro corporativo
      pdf.rect(0, 0, 210, 45, 'F');
      
      if (data.logoUrl) {
        try {
          // Corrigir carregamento da logo do Supabase
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          
          // Aguardar carregamento da imagem
          await new Promise<void>((resolve, reject) => {
            logoImg.onload = () => resolve();
            logoImg.onerror = () => {
              console.warn('Erro ao carregar logo do Supabase');
              reject(new Error('Falha no carregamento da logo'));
            };
            // Garantir que a URL seja válida
            logoImg.src = data.logoUrl!;
          });
          
          // Logo posicionada elegantemente no cabeçalho
          const logoWidth = 35;
          const logoHeight = 25;
          pdf.addImage(logoImg, 'PNG', 20, 10, logoWidth, logoHeight);
          
          // Nome da empresa ao lado da logo (texto branco)
          if (data.companyName) {
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255); // Branco
            pdf.text(data.companyName, 65, 25);
          }
        } catch (error) {
          console.warn('Logo não pôde ser carregada:', error);
        }
      }
      
      // Título CLTFácil no cabeçalho (lado direito)
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255); // Branco
      pdf.text('CLTFácil.com', 190, 25, { align: 'right' });
      
      yPosition = 60;
      
      // === TÍTULO PRINCIPAL DO DOCUMENTO ===
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 58, 138); // Azul escuro
      pdf.text('Relatório de Cálculo Trabalhista', 20, yPosition);
      
      yPosition += 20;
      
      // === CAIXA DESTACADA PARA CALCULADORA ===
      pdf.setFillColor(239, 246, 255); // Azul muito claro
      pdf.setDrawColor(59, 130, 246); // Borda azul média
      pdf.setLineWidth(1);
      pdf.rect(20, yPosition - 8, 170, 22, 'FD');
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 58, 138); // Azul escuro
      pdf.text(data.calculatorName, 25, yPosition + 5);
      
      yPosition += 25;
      
      // Data e hora de geração
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99); // Cinza escuro
      const currentDate = new Date();
      const dateStr = currentDate.toLocaleDateString('pt-BR');
      const timeStr = currentDate.toLocaleTimeString('pt-BR');
      pdf.text(`Gerado em: ${dateStr} às ${timeStr}`, 20, yPosition);
      
      yPosition += 25;
      
      // === LINHA SEPARADORA AZUL ELEGANTE ===
      pdf.setDrawColor(59, 130, 246); // Azul médio
      pdf.setLineWidth(1.5);
      pdf.line(20, yPosition, 190, yPosition);
      
      yPosition += 20;
      
      // === SEÇÃO DE RESULTADOS ===
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 58, 138); // Azul escuro
      pdf.text('Resultados do Cálculo', 20, yPosition);
      
      yPosition += 15;
      
      // === TABELA DE RESULTADOS COM DESIGN CORPORATIVO ===
      data.results.forEach((result, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }
        
        // Verificar se é um valor importante (contém R$ ou %)
        const isImportantValue = result.value.includes('R$') || result.value.includes('%');
        
        if (isImportantValue) {
          // Caixa destacada azul para valores importantes
          pdf.setFillColor(239, 246, 255); // Azul muito claro
          pdf.setDrawColor(59, 130, 246); // Borda azul média
          pdf.setLineWidth(0.8);
          pdf.rect(20, yPosition - 4, 170, 16, 'FD');
        } else {
          // Alternância sutil para melhor legibilidade
          const isEven = index % 2 === 0;
          if (isEven) {
            pdf.setFillColor(249, 250, 251); // Cinza muito claro
            pdf.rect(20, yPosition - 4, 170, 16, 'F');
          }
        }
        
        // Label do resultado
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(55, 65, 81); // Cinza escuro
        pdf.text(result.label, 25, yPosition + 6);
        
        // Valor do resultado
        pdf.setFontSize(12);
        pdf.setFont('helvetica', isImportantValue ? 'bold' : 'normal');
        if (isImportantValue) {
          pdf.setTextColor(30, 58, 138); // Azul escuro para valores importantes
        } else {
          pdf.setTextColor(17, 24, 39); // Preto para valores normais
        }
        pdf.text(result.value, 185, yPosition + 6, { align: 'right' });
        
        yPosition += 16;
      });
      
      // === RODAPÉ COM DISCLAIMER PROFISSIONAL ===
      yPosition += 25;
      if (yPosition > 230) {
        pdf.addPage();
        yPosition = 30;
      }
      
      // Caixa de disclaimer elegante
      pdf.setFillColor(254, 249, 195); // Amarelo muito claro
      pdf.setDrawColor(217, 119, 6); // Borda laranja
      pdf.setLineWidth(0.8);
      pdf.rect(20, yPosition - 8, 170, 35, 'FD');
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(146, 64, 14); // Laranja escuro
      pdf.text('⚠️ IMPORTANTE', 25, yPosition + 2);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(92, 57, 19); // Marrom
      const disclaimer1 = 'Este relatório apresenta uma estimativa baseada nas informações fornecidas.';
      const disclaimer2 = 'Para análises jurídicas específicas, recomenda-se consultar um';
      const disclaimer3 = 'profissional especializado em direito trabalhista.';
      pdf.text(disclaimer1, 25, yPosition + 12);
      pdf.text(disclaimer2, 25, yPosition + 20);
      pdf.text(disclaimer3, 25, yPosition + 28);
      
      // === RODAPÉ CORPORATIVO FINAL ===
      yPosition += 50;
      
      // Linha azul no rodapé
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(1);
      pdf.line(20, yPosition, 190, yPosition);
      
      yPosition += 8;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128); // Cinza médio
      pdf.text('Gerado por CLTFácil.com - Plataforma de Cálculos Trabalhistas', 105, yPosition, { align: 'center' });
      
      // Nome do arquivo otimizado
      const fileName = `cltfacil-${data.calculatorName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      
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