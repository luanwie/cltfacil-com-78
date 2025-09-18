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
      
      // === CABEÇALHO MODERNO COM DESIGN PREMIUM ===
      // Fundo principal azul vibrante
      pdf.setFillColor(37, 99, 235); // Azul vibrante
      pdf.rect(0, 0, 210, 55, 'F');
      
      // Overlay com gradiente simulado
      pdf.setFillColor(29, 78, 216); // Azul mais profundo
      pdf.rect(0, 0, 210, 28, 'F');
      
      // Accent line no topo
      pdf.setFillColor(96, 165, 250); // Azul claro
      pdf.rect(0, 0, 210, 3, 'F');
      
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
          
          // Logo com posicionamento premium
          const logoWidth = 42;
          const logoHeight = 30;
          pdf.addImage(logoImg, 'PNG', 25, 12, logoWidth, logoHeight);
          
          // Nome da empresa com estilo moderno
          if (data.companyName) {
            pdf.setFontSize(24);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text(data.companyName, 75, 30);
          }
        } catch (error) {
          console.warn('Logo não pôde ser carregada:', error);
        }
      }
      
      // Branding CLTFácil premium
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text('CLTFácil', 185, 26, { align: 'right' });
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(191, 219, 254); // Azul muito claro
      pdf.text('Cálculos Trabalhistas Profissionais', 185, 36, { align: 'right' });
      
      yPosition = 70;
      
      // === TÍTULO PRINCIPAL COM CARD MODERNO ===
      // Shadow effect simulado
      pdf.setFillColor(226, 232, 240); // Sombra cinza
      pdf.rect(22, yPosition - 3, 170, 38, 'F');
      
      // Card principal
      pdf.setFillColor(255, 255, 255); // Branco puro
      pdf.setDrawColor(203, 213, 225); // Borda cinza
      pdf.setLineWidth(1);
      pdf.rect(20, yPosition - 5, 170, 38, 'FD');
      
      // Accent bar azul
      pdf.setFillColor(37, 99, 235);
      pdf.rect(20, yPosition - 5, 5, 38, 'F');
      
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42); // Cinza quase preto
      pdf.text('📊 Relatório de Cálculo', 30, yPosition + 8);
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(37, 99, 235); // Azul primário
      pdf.text(data.calculatorName, 30, yPosition + 24);
      
      yPosition += 50;
      
      // === INFORMAÇÕES DE GERAÇÃO COM DESIGN MODERNO ===
      pdf.setFillColor(239, 246, 255); // Azul ultra claro
      pdf.setDrawColor(147, 197, 253); // Borda azul suave
      pdf.rect(20, yPosition - 2, 170, 20, 'FD');
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(29, 78, 216); // Azul escuro
      const currentDate = new Date();
      const dateStr = currentDate.toLocaleDateString('pt-BR', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const timeStr = currentDate.toLocaleTimeString('pt-BR');
      pdf.text(`📅 Gerado em ${dateStr} às ${timeStr}`, 25, yPosition + 10);
      
      yPosition += 35;
      
      // === SEÇÃO DE RESULTADOS COM TÍTULO MODERNO ===
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('💼 Detalhamento Completo dos Cálculos', 20, yPosition);
      
      yPosition += 25;
      
      // === CARDS PREMIUM PARA CADA RESULTADO ===
      data.results.forEach((result, index) => {
        if (yPosition > 235) {
          pdf.addPage();
          yPosition = 30;
          
          // Repetir título da seção na nova página com estilo
          pdf.setFontSize(22);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(15, 23, 42);
          pdf.text('💼 Detalhamento dos Cálculos (continuação)', 20, yPosition);
          yPosition += 30;
        }
        
        const isImportantValue = result.value.includes('R$') || result.value.includes('%');
        const cardHeight = 22;
        
        // Shadow effect para todos os cards
        pdf.setFillColor(226, 232, 240); // Sombra
        pdf.rect(22, yPosition - 1, 170, cardHeight, 'F');
        
        if (isImportantValue) {
          // Card premium para valores importantes
          pdf.setFillColor(37, 99, 235); // Azul vibrante
          pdf.rect(20, yPosition - 3, 170, cardHeight, 'F');
          
          // Accent border superior
          pdf.setFillColor(96, 165, 250); // Azul mais claro
          pdf.rect(20, yPosition - 3, 170, 3, 'F');
          
          // Icon area
          pdf.setFillColor(29, 78, 216); // Azul mais escuro
          pdf.rect(20, yPosition - 3, 8, cardHeight, 'F');
          
          // Texto com contraste perfeito
          pdf.setTextColor(255, 255, 255);
        } else {
          // Card elegante para valores normais
          pdf.setFillColor(248, 250, 252); // Cinza ultra claro
          pdf.setDrawColor(203, 213, 225); // Borda suave
          pdf.setLineWidth(0.5);
          pdf.rect(20, yPosition - 3, 170, cardHeight, 'FD');
          
          // Accent left border colorido
          pdf.setFillColor(148, 163, 184); // Cinza médio
          pdf.rect(20, yPosition - 3, 3, cardHeight, 'F');
          
          pdf.setTextColor(51, 65, 85); // Cinza escuro
        }
        
        // Label do resultado com melhor espaçamento
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        if (isImportantValue) {
          pdf.text('💰', 25, yPosition + 9);
          pdf.text(result.label, 35, yPosition + 9);
        } else {
          pdf.text('•', 26, yPosition + 9);
          pdf.text(result.label, 32, yPosition + 9);
        }
        
        // Valor do resultado com destaque
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(result.value, 185, yPosition + 9, { align: 'right' });
        
        yPosition += cardHeight + 4;
      });
      
      // === DISCLAIMER PREMIUM COM DESIGN MODERNO ===
      yPosition += 20;
      if (yPosition > 210) {
        pdf.addPage();
        yPosition = 30;
      }
      
      // Shadow para o disclaimer
      pdf.setFillColor(254, 226, 226); // Rosa claro shadow
      pdf.rect(22, yPosition - 6, 170, 50, 'F');
      
      // Card principal do disclaimer
      pdf.setFillColor(254, 242, 242); // Rosa ultra claro
      pdf.setDrawColor(248, 113, 113); // Borda rosa
      pdf.setLineWidth(1.5);
      pdf.rect(20, yPosition - 8, 170, 50, 'FD');
      
      // Accent border esquerda mais espessa
      pdf.setFillColor(220, 38, 38); // Vermelho vibrante
      pdf.rect(20, yPosition - 8, 6, 50, 'F');
      
      // Icon area
      pdf.setFillColor(239, 68, 68); // Vermelho médio
      pdf.rect(26, yPosition - 8, 15, 20, 'F');
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255); // Branco no icon area
      pdf.text('⚠️', 30, yPosition + 2);
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(153, 27, 27); // Vermelho escuro
      pdf.text('IMPORTANTE - LEIA ATENTAMENTE', 45, yPosition + 2);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(127, 29, 29); // Vermelho médio
      const disclaimer1 = 'Este relatório apresenta uma estimativa calculada com base nas informações fornecidas';
      const disclaimer2 = 'e na legislação trabalhista vigente. Para análises jurídicas específicas, situações';
      const disclaimer3 = 'complexas ou decisões críticas, recomenda-se sempre consultar um profissional';
      const disclaimer4 = 'qualificado em direito trabalhista ou departamento de Recursos Humanos.';
      pdf.text(disclaimer1, 30, yPosition + 16);
      pdf.text(disclaimer2, 30, yPosition + 24);
      pdf.text(disclaimer3, 30, yPosition + 32);
      pdf.text(disclaimer4, 30, yPosition + 40);
      
      // === RODAPÉ CORPORATIVO PREMIUM ===
      yPosition += 65;
      
      // Linha separadora elegante com gradiente simulado
      pdf.setDrawColor(37, 99, 235);
      pdf.setLineWidth(2);
      pdf.line(20, yPosition, 190, yPosition);
      
      pdf.setDrawColor(96, 165, 250);
      pdf.setLineWidth(1);
      pdf.line(20, yPosition + 1, 190, yPosition + 1);
      
      yPosition += 15;
      
      // Logo text do rodapé
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(37, 99, 235); // Azul primário
      pdf.text('CLTFácil.com', 105, yPosition, { align: 'center' });
      
      yPosition += 8;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139); // Cinza médio
      pdf.text('Plataforma Completa de Cálculos Trabalhistas • Confiável • Precisa • Atualizada', 105, yPosition, { align: 'center' });
      
      yPosition += 6;
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184); // Cinza claro
      pdf.text(`Documento gerado automaticamente • Versão ${new Date().getFullYear()} • Todos os direitos reservados`, 105, yPosition, { align: 'center' });
      
      // Nome do arquivo otimizado com timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `cltfacil-${data.calculatorName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.pdf`;
      
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