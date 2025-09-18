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
      let yPosition = 0;
      
      // === CABEÇALHO MODERNO COM GRADIENTE ===
      // Fundo gradiente azul moderno
      pdf.setFillColor(59, 130, 246); // Azul primário
      pdf.rect(0, 0, 210, 50, 'F');
      
      // Efeito de gradiente simulado com sobreposição
      pdf.setFillColor(37, 99, 235); // Azul mais escuro
      pdf.rect(0, 0, 210, 25, 'F');
      
      if (data.logoUrl) {
        try {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          
          await new Promise<void>((resolve, reject) => {
            logoImg.onload = () => resolve();
            logoImg.onerror = () => {
              console.warn('Erro ao carregar logo');
              reject(new Error('Falha no carregamento da logo'));
            };
            logoImg.src = data.logoUrl!;
          });
          
          // Logo moderna com sombra simulada
          const logoWidth = 40;
          const logoHeight = 28;
          pdf.addImage(logoImg, 'PNG', 25, 11, logoWidth, logoHeight);
          
          // Nome da empresa com tipografia moderna
          if (data.companyName) {
            pdf.setFontSize(22);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text(data.companyName, 75, 28);
          }
        } catch (error) {
          console.warn('Logo não pôde ser carregada:', error);
        }
      }
      
      // Branding CLTFácil moderno
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text('CLTFácil', 185, 28, { align: 'right' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(219, 234, 254); // Azul claro
      pdf.text('Cálculos Trabalhistas', 185, 38, { align: 'right' });
      
      yPosition = 65;
      
      // === TÍTULO PRINCIPAL MODERNO ===
      // Card container para o título
      pdf.setFillColor(248, 250, 252); // Fundo cinza muito claro
      pdf.setDrawColor(226, 232, 240); // Borda cinza clara
      pdf.setLineWidth(1);
      pdf.rect(20, yPosition - 5, 170, 35, 'FD');
      
      pdf.setFontSize(26);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42); // Cinza muito escuro
      pdf.text('Relatório de Cálculo', 25, yPosition + 8);
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(59, 130, 246); // Azul primário
      pdf.text(data.calculatorName, 25, yPosition + 22);
      
      yPosition += 45;
      
      // Data e hora com design moderno
      pdf.setFillColor(219, 234, 254); // Azul muito claro
      pdf.rect(20, yPosition - 2, 170, 18, 'F');
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(30, 64, 175); // Azul escuro
      const currentDate = new Date();
      const dateStr = currentDate.toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const timeStr = currentDate.toLocaleTimeString('pt-BR');
      pdf.text(`📅 Gerado em ${dateStr} às ${timeStr}`, 25, yPosition + 8);
      
      yPosition += 30;
      
      // === SEÇÃO DE RESULTADOS MODERNIZADA ===
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('📊 Detalhamento dos Cálculos', 20, yPosition);
      
      yPosition += 20;
      
      // === CARDS MODERNOS PARA RESULTADOS ===
      data.results.forEach((result, index) => {
        if (yPosition > 240) {
          pdf.addPage();
          yPosition = 30;
          
          // Repetir título da seção na nova página
          pdf.setFontSize(20);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(15, 23, 42);
          pdf.text('📊 Detalhamento dos Cálculos (cont.)', 20, yPosition);
          yPosition += 25;
        }
        
        const isImportantValue = result.value.includes('R$') || result.value.includes('%');
        const cardHeight = 20;
        
        if (isImportantValue) {
          // Card destacado para valores importantes
          pdf.setFillColor(37, 99, 235); // Azul primário
          pdf.rect(20, yPosition - 3, 170, cardHeight, 'F');
          
          // Borda left accent
          pdf.setFillColor(59, 130, 246); // Azul mais claro
          pdf.rect(20, yPosition - 3, 4, cardHeight, 'F');
          
          // Texto branco para contraste
          pdf.setTextColor(255, 255, 255);
        } else {
          // Card normal
          pdf.setFillColor(248, 250, 252); // Cinza muito claro
          pdf.setDrawColor(226, 232, 240); // Borda cinza
          pdf.setLineWidth(0.5);
          pdf.rect(20, yPosition - 3, 170, cardHeight, 'FD');
          
          // Accent left border
          pdf.setFillColor(148, 163, 184); // Cinza médio
          pdf.rect(20, yPosition - 3, 2, cardHeight, 'F');
          
          pdf.setTextColor(51, 65, 85); // Cinza escuro
        }
        
        // Label do resultado com melhor tipografia
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(result.label, 30, yPosition + 8);
        
        // Valor do resultado
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.text(result.value, 185, yPosition + 8, { align: 'right' });
        
        yPosition += cardHeight + 3;
      });
      
      // === DISCLAIMER MODERNO ===
      yPosition += 25;
      if (yPosition > 220) {
        pdf.addPage();
        yPosition = 30;
      }
      
      // Card de disclaimer com design moderno
      pdf.setFillColor(252, 165, 165); // Rosa muito claro
      pdf.setDrawColor(239, 68, 68); // Borda vermelha
      pdf.setLineWidth(1);
      pdf.rect(20, yPosition - 8, 170, 45, 'FD');
      
      // Accent border esquerda
      pdf.setFillColor(220, 38, 38); // Vermelho mais escuro
      pdf.rect(20, yPosition - 8, 4, 45, 'F');
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(153, 27, 27); // Vermelho escuro
      pdf.text('⚠️ IMPORTANTE - LEIA COM ATENÇÃO', 30, yPosition + 3);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(127, 29, 29); // Vermelho médio
      const disclaimer1 = 'Este relatório apresenta uma estimativa baseada nas informações fornecidas e na';
      const disclaimer2 = 'legislação trabalhista vigente. Para análises jurídicas específicas, situações';
      const disclaimer3 = 'complexas ou decisões importantes, recomenda-se sempre consultar um profissional';
      const disclaimer4 = 'especializado em direito trabalhista ou departamento de Recursos Humanos.';
      pdf.text(disclaimer1, 30, yPosition + 15);
      pdf.text(disclaimer2, 30, yPosition + 23);
      pdf.text(disclaimer3, 30, yPosition + 31);
      pdf.text(disclaimer4, 30, yPosition + 39);
      
      // === RODAPÉ CORPORATIVO MODERNO ===
      yPosition += 60;
      
      // Linha separadora elegante
      pdf.setDrawColor(148, 163, 184);
      pdf.setLineWidth(1);
      pdf.line(20, yPosition, 190, yPosition);
      
      yPosition += 12;
      
      // Informações do rodapé com melhor design
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246); // Azul primário
      pdf.text('CLTFácil.com', 105, yPosition, { align: 'center' });
      
      yPosition += 8;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139); // Cinza médio
      pdf.text('Plataforma Completa de Cálculos Trabalhistas para PMEs', 105, yPosition, { align: 'center' });
      
      yPosition += 6;
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184); // Cinza mais claro
      pdf.text(`Documento gerado automaticamente • Versão ${new Date().getFullYear()}`, 105, yPosition, { align: 'center' });
      
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