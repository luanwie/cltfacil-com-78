import Container from "@/components/ui/container";
import PageHeader from "@/components/ui/page-header";
import { useProAndUsage } from "@/hooks/useProAndUsage";
import UsageBanner from "@/components/UsageBanner";
import { navigateToProPage } from "@/utils/proRedirect";
import { useNavigate, useLocation } from "react-router-dom";

import RescisaoCalculator from "@/components/calculators/RescisaoCalculator";
import FAQ from "@/components/ui/faq";
import Notice from "@/components/ui/notice";
import { useSEO } from "@/hooks/useSEO";

const Rescisao = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ctx = useProAndUsage();

  useSEO({
    title: "Calculadora de Rescisão Trabalhista | Cálculo CLT Completo",
    description:
      "Calcule rescisão trabalhista completa: saldo salário, 13º, férias, aviso prévio, FGTS. Todos os tipos de rescisão CLT. Ferramenta gratuita e confiável.",
    keywords:
      "rescisão trabalhista, cálculo rescisão, CLT, demissão, aviso prévio, FGTS, 13º salário, férias proporcionais",
    canonical: "/clt/rescisao",
  });

  const faqItems = [
    {
      question: "Quais tipos de rescisão posso calcular?",
      answer:
        "Nossa calculadora contempla todos os tipos: demissão sem justa causa, pedido de demissão, acordo (484-A), término de contrato determinado e justa causa.",
    },
    {
      question: "Como é calculado o aviso prévio progressivo?",
      answer:
        "30 dias base + 3 dias por ano completo trabalhado após o primeiro ano, limitado a 90 dias. Ex: 3 anos = 30 + (2×3) = 36 dias.",
    },
    {
      question: "Quando tenho direito ao saque do FGTS?",
      answer:
        "Demissão sem justa causa: 100% + multa 40%. Acordo 484-A: até 80% + multa 20%. Pedido de demissão: sem direito ao saque.",
    },
    {
      question: "Como funciona o acordo 484-A?",
      answer:
        "No acordo: aviso prévio pela metade, multa FGTS 20%, saque até 80% do FGTS, mas sem direito ao seguro-desemprego.",
    },
    {
      question: "Os valores são líquidos ou brutos?",
      answer:
        "Os valores apresentados são brutos, antes dos descontos de INSS e IRRF que podem incidir sobre algumas parcelas.",
    },
    {
      question: "Como são calculadas as férias proporcionais?",
      answer:
        "2,5 dias por mês completo trabalhado no período aquisitivo atual + 1/3 constitucional. Mês conta se trabalhou 15+ dias.",
    },
  ];

  return (
    <>
      <section className="py-12">
        <Container>
          <PageHeader
            title="Calculadora de Rescisão Trabalhista"
            description="Calcule todos os valores da rescisão trabalhista CLT de forma completa e precisa. Inclui saldo de salário, 13º proporcional, férias, aviso prévio e FGTS."
          />
        </Container>
      </section>

      <section className="pb-8">
        <Container>
          <Notice>
            <div>
              <h4 className="font-semibold mb-2">Informação Importante</h4>
              <p>
                Esta calculadora fornece estimativas baseadas na legislação CLT vigente. Para situações específicas, consulte sempre um
                advogado trabalhista ou contador.
              </p>
            </div>
          </Notice>
        </Container>
      </section>

      <section className="pb-12">
        <Container>
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Banner GLOBAL + CTA PRO */}
            <div id="usage-banner">
              <UsageBanner
                remaining={ctx.remaining}
                isPro={ctx.isPro}
                isLogged={ctx.isLogged}
                onGoPro={() => navigateToProPage(navigate, ctx.isLogged, location.pathname)}
              />
            </div>

            <RescisaoCalculator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="font-semibold mb-4">Documentos Necessários</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Carteira de trabalho</li>
                  <li>• Contracheques recentes</li>
                  <li>• Extrato FGTS atualizado</li>
                  <li>• Comprovante de férias vencidas</li>
                  <li>• Termo de rescisão (TRCT)</li>
                </ul>
              </div>

              <div className="bg-card rounded-lg p-6 border">
                <h3 className="font-semibold mb-4">Prazos Importantes</h3>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Pagamento:</strong> 1º dia útil após o término ou 10 dias corridos</li>
                  <li>• <strong>Seguro-desemprego:</strong> 7 a 120 dias após demissão</li>
                  <li>• <strong>Saque FGTS:</strong> Imediato após homologação</li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 bg-muted/30">
        <Container>
          <FAQ title="Perguntas Frequentes sobre Rescisão" items={faqItems} />
        </Container>
      </section>
    </>
  );
};

export default Rescisao;
